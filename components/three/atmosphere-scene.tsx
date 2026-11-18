'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasContainer } from './canvas-container';
import { calculateAtmosphereParticles } from './scene-math';

export interface AtmosphereSceneProps {
  pm25: number;
  aqi: number;
  boundaryLayerHeightM: number;
  inversionScore: number;
  windSpeedKmh: number;
}

function ParticleField({
  count,
  color,
  speed,
  size,
  heightRange,
}: {
  count: number;
  color: string;
  speed: number;
  size: number;
  heightRange: [number, number];
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const init = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 12;
      const y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
    }
    return [pos, init];
  }, [count, heightRange]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Drift gently along X with wind and bob vertically
      posArr[i * 3] += delta * speed * 0.4;
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * speed + i) * delta * 0.08;

      // Wrap around bounds
      if (posArr[i * 3] > 6) posArr[i * 3] = -6;
      if (posArr[i * 3 + 1] > heightRange[1]) posArr[i * 3 + 1] = heightRange[0];
      if (posArr[i * 3 + 1] < heightRange[0]) posArr[i * 3 + 1] = heightRange[1];
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function InversionSceneContent({
  pm25,
  aqi,
  boundaryLayerHeightM,
  isInverted,
  windSpeedKmh,
}: {
  pm25: number;
  aqi: number;
  boundaryLayerHeightM: number;
  isInverted: boolean;
  windSpeedKmh: number;
}) {
  const particleConfig = useMemo(
    () => calculateAtmosphereParticles(pm25, boundaryLayerHeightM, isInverted),
    [pm25, boundaryLayerHeightM, isInverted]
  );

  const lidHeightY = isInverted ? Math.max(1.5, Math.min(3.2, boundaryLayerHeightM / 180)) : 5.2;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.0} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={18}
        minDistance={5}
        maxPolarAngle={Math.PI / 2 - 0.05} // Keep camera above ground
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 14, 16, 16]} />
        <meshStandardMaterial color="#0b1320" wireframe={false} roughness={0.9} />
      </mesh>
      <gridHelper args={[14, 14, '#10b981', '#1f293d']} position={[0, 0.01, 0]} />

      {/* Terrain Elevation Reference Marker */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.22}
        color="#34d399"
        anchorX="center"
        anchorY="middle"
      >
        Ground Station (0m)
      </Text>

      {/* Inversion Layer Ceiling Lid */}
      <mesh position={[0, lidHeightY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color={isInverted ? '#f59e0b' : '#38bdf8'}
          transparent
          opacity={isInverted ? 0.35 : 0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling Border / Label */}
      <Text
        position={[0, lidHeightY + 0.3, 0]}
        fontSize={0.26}
        color={isInverted ? '#fbbf24' : '#7dd3fc'}
        anchorX="center"
        anchorY="bottom"
      >
        {isInverted
          ? `Thermal Inversion Lid (~${Math.round(boundaryLayerHeightM)}m)`
          : `Convective Boundary Layer (~${Math.round(boundaryLayerHeightM)}m)`}
      </Text>

      {/* Particulate Smoke Cloud */}
      <ParticleField
        count={particleConfig.count}
        color={particleConfig.color}
        speed={particleConfig.speed}
        size={particleConfig.size}
        heightRange={particleConfig.heightRange}
      />
    </>
  );
}

export function AtmosphereScene({
  pm25,
  aqi,
  boundaryLayerHeightM,
  inversionScore,
  windSpeedKmh,
}: AtmosphereSceneProps) {
  const [userInversionToggle, setUserInversionToggle] = useState<boolean | null>(null);
  const actualInversion = inversionScore >= 50;
  const isInverted = userInversionToggle !== null ? userInversionToggle : actualInversion;

  // 2D Accessible Fallback View
  const fallback2D = (
    <div className="w-full max-w-md mx-auto p-5 bg-card/90 rounded-xl border border-border space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">
          Atmospheric Boundary Layer Profile
        </h4>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            isInverted ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {isInverted ? 'Inversion Active' : 'Normal Dispersion'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">Ambient PM2.5 Concentration:</span>
          <span className="font-mono font-medium text-foreground">{pm25} µg/m³</span>
        </div>
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">CPCB NAQI Index:</span>
          <span className="font-mono font-medium text-foreground">{aqi}</span>
        </div>
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">Boundary Layer Height (BLH):</span>
          <span className="font-mono font-medium text-foreground">{Math.round(boundaryLayerHeightM)} m</span>
        </div>
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">Inversion Risk Score:</span>
          <span className="font-mono font-medium text-foreground">{inversionScore}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Surface Wind Speed:</span>
          <span className="font-mono font-medium text-foreground">{windSpeedKmh} km/h</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {isInverted
          ? 'Thermal inversion creates a stable atmospheric lid, compressing particulate matter into a shallow surface layer.'
          : 'Normal lapse rates promote convective mixing and dilution of urban emissions.'}
      </p>
    </div>
  );

  return (
    <CanvasContainer
      title="3D Atmospheric Inversion & Smog Dynamics"
      badge={isInverted ? 'INVERSION LID ACTIVE' : 'CONVECTIVE MIXING'}
      fallback2D={fallback2D}
      description="Interactive 3D model of surface layer compression and particulate concentration."
    >
      <div className="relative w-full h-full">
        {/* In-canvas simulation controls */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5 bg-background/85 backdrop-blur-md p-1.5 rounded-lg border border-border/70 text-xs">
          <button
            type="button"
            onClick={() => setUserInversionToggle(true)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              isInverted
                ? 'bg-amber-600 text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inversion Trap
          </button>
          <button
            type="button"
            onClick={() => setUserInversionToggle(false)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              !isInverted
                ? 'bg-emerald-600 text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Convective Dispersion
          </button>
        </div>

        <Canvas
          camera={{ position: [0, 4, 10], fov: 45 }}
          className="w-full h-full"
        >
          <InversionSceneContent
            pm25={pm25}
            aqi={aqi}
            boundaryLayerHeightM={boundaryLayerHeightM}
            isInverted={isInverted}
            windSpeedKmh={windSpeedKmh}
          />
        </Canvas>
      </div>
    </CanvasContainer>
  );
}
