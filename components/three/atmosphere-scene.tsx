'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasContainer } from './canvas-container';
import { calculateAtmosphereParticles } from './scene-math';
import { Sun, Moon, Wind, Layers, ArrowUpRight, Gauge } from 'lucide-react';

export interface AtmosphereSceneProps {
  pm25: number;
  aqi: number;
  boundaryLayerHeightM: number;
  inversionScore: number;
  windSpeedKmh: number;
}

// Procedural urban building definition
interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  hasAntenna?: boolean;
}

// Generate realistic urban buildings with street grid layout
function generateUrbanSkyline(): BuildingData[] {
  const buildings: BuildingData[] = [];
  const palette = ['#0f172a', '#1e293b', '#111827', '#0e1726', '#141e2e'];
  
  // Grid layout with street corridors
  const blocks = [
    { x: -3.2, z: -3.2 }, { x: -1.0, z: -3.2 }, { x: 1.2, z: -3.2 }, { x: 3.4, z: -3.2 },
    { x: -3.2, z: -1.0 }, { x: -1.0, z: -1.0 }, { x: 1.2, z: -1.0 }, { x: 3.4, z: -1.0 },
    { x: -3.2, z: 1.2 },  { x: -1.0, z: 1.2 },  { x: 1.2, z: 1.2 },  { x: 3.4, z: 1.2 },
    { x: -3.2, z: 3.4 },  { x: -1.0, z: 3.4 },  { x: 1.2, z: 3.4 },  { x: 3.4, z: 3.4 },
  ];

  blocks.forEach((block, idx) => {
    // 2 sub-buildings per block
    const h1 = 0.6 + ((idx * 7) % 11) * 0.14; // Heights from 0.6 to 2.0
    buildings.push({
      x: block.x - 0.35,
      z: block.z - 0.35,
      width: 0.8 + ((idx % 3) * 0.1),
      depth: 0.8 + ((idx % 2) * 0.1),
      height: h1,
      color: palette[idx % palette.length],
      hasAntenna: h1 > 1.4,
    });

    const h2 = 0.4 + (((idx + 4) * 5) % 9) * 0.12;
    buildings.push({
      x: block.x + 0.45,
      z: block.z + 0.45,
      width: 0.7,
      depth: 0.7,
      height: h2,
      color: palette[(idx + 2) % palette.length],
      hasAntenna: false,
    });
  });

  return buildings;
}

// 3D City Buildings Mesh Group
function ProceduralCity() {
  const buildings = useMemo(() => generateUrbanSkyline(), []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.height / 2, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Roof HVAC/edge detail */}
          <mesh position={[0, b.height / 2 + 0.05, 0]}>
            <boxGeometry args={[b.width * 0.5, 0.1, b.depth * 0.5]} />
            <meshStandardMaterial color="#0b1120" roughness={0.9} />
          </mesh>

          {/* Rooftop Antenna for tall structures */}
          {b.hasAntenna && (
            <mesh position={[0, b.height / 2 + 0.3, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.5, 8]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* Ground Station / CAAQMS Monitoring Tower */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.3, 16]} />
          <meshStandardMaterial color="#0f766e" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#14b8a6" emissive="#0d9488" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#14b8a6" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

// Vertical Metric Altitude Scale (0m - 1200m)
function AltitudeScaleRuler({
  boundaryLayerHeightM,
  isInverted,
  maxBlhM = 1200,
}: {
  boundaryLayerHeightM: number;
  isInverted: boolean;
  maxBlhM?: number;
}) {
  const ticks = [0, 200, 400, 600, 800, 1000, 1200];
  const maxSceneHeight = 5.0; // 3D units corresponding to 1200m

  const currentLidY = Math.min(
    maxSceneHeight,
    Math.max(0.5, (boundaryLayerHeightM / maxBlhM) * maxSceneHeight)
  );

  return (
    <group position={[-5.2, 0, -5.2]}>
      {/* Vertical Mast Pole */}
      <mesh position={[0, maxSceneHeight / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, maxSceneHeight, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Altitude Tick Lines & Labels */}
      {ticks.map((tick) => {
        const y = (tick / maxBlhM) * maxSceneHeight;
        return (
          <group key={tick} position={[0, y, 0]}>
            <mesh position={[0.2, 0, 0]}>
              <boxGeometry args={[0.4, 0.02, 0.02]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <Text
              position={[0.55, 0, 0]}
              fontSize={0.2}
              color="#94a3b8"
              anchorX="left"
              anchorY="middle"
            >
              {`${tick}m`}
            </Text>
          </group>
        );
      })}

      {/* Active Boundary Layer / Inversion Height Target Indicator */}
      <group position={[0, currentLidY, 0]}>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.04, 0.04]} />
          <meshStandardMaterial
            color={isInverted ? '#f59e0b' : '#38bdf8'}
            emissive={isInverted ? '#d97706' : '#0284c7'}
            emissiveIntensity={1.0}
          />
        </mesh>
        <Text
          position={[0.7, 0, 0]}
          fontSize={0.22}
          color={isInverted ? '#fbbf24' : '#7dd3fc'}
          anchorX="left"
          anchorY="middle"
        >
          {`BLH: ${Math.round(boundaryLayerHeightM)}m`}
        </Text>
      </group>
    </group>
  );
}

// Particle field with drifting smoke and inversion boundary containment
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

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 11;
      const z = (Math.random() - 0.5) * 11;
      const y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return [pos];
  }, [count, heightRange]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArr = posAttr.array as Float32Array;

    const [minY, maxY] = heightRange;

    for (let i = 0; i < count; i++) {
      // Drift gently along X with wind and bob vertically
      posArr[i * 3] += delta * speed * 0.35;
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * speed + i) * delta * 0.05;

      // Wrap around bounds
      if (posArr[i * 3] > 5.5) posArr[i * 3] = -5.5;
      if (posArr[i * 3 + 1] > maxY) posArr[i * 3 + 1] = minY;
      if (posArr[i * 3 + 1] < minY) posArr[i * 3 + 1] = maxY;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Inversion Lid Ceiling Mesh with animated glow
function InversionCeilingLid({
  lidHeightY,
  isInverted,
  boundaryLayerHeightM,
}: {
  lidHeightY: number;
  isInverted: boolean;
  boundaryLayerHeightM: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isInverted) {
      // Gentle breathing pulse when thermal inversion is trapping emissions
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      meshRef.current.position.y = lidHeightY + pulse;
    } else {
      meshRef.current.position.y = lidHeightY;
    }
  });

  return (
    <group>
      {/* Ceiling Plane */}
      <mesh
        ref={meshRef}
        position={[0, lidHeightY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[11.5, 11.5]} />
        <meshStandardMaterial
          color={isInverted ? '#f59e0b' : '#38bdf8'}
          emissive={isInverted ? '#d97706' : '#0284c7'}
          emissiveIntensity={isInverted ? 0.45 : 0.15}
          transparent
          opacity={isInverted ? 0.38 : 0.12}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>

      {/* Dynamic Floating Label */}
      <Text
        position={[0, lidHeightY + 0.35, 0]}
        fontSize={0.26}
        color={isInverted ? '#fbbf24' : '#7dd3fc'}
        anchorX="center"
        anchorY="bottom"
      >
        {isInverted
          ? `Thermal Inversion Lid (~${Math.round(boundaryLayerHeightM)}m)`
          : `Convective Boundary Layer (~${Math.round(boundaryLayerHeightM)}m)`}
      </Text>
    </group>
  );
}

function InversionSceneContent({
  pm25,
  boundaryLayerHeightM,
  isInverted,
  isNocturnal,
}: {
  pm25: number;
  boundaryLayerHeightM: number;
  isInverted: boolean;
  isNocturnal: boolean;
}) {
  const particleConfig = useMemo(
    () => calculateAtmosphereParticles(pm25, boundaryLayerHeightM, isInverted),
    [pm25, boundaryLayerHeightM, isInverted]
  );

  const maxSceneHeight = 5.0;
  const maxBlhM = 1200;
  const lidHeightY = Math.min(
    maxSceneHeight,
    Math.max(0.6, (boundaryLayerHeightM / maxBlhM) * maxSceneHeight)
  );

  return (
    <>
      {/* Dynamic Diurnal Lighting */}
      <ambientLight intensity={isNocturnal ? 0.25 : 0.55} />
      <directionalLight
        position={isNocturnal ? [5, 10, -5] : [10, 15, 10]}
        intensity={isNocturnal ? 0.5 : 1.2}
        color={isNocturnal ? '#93c5fd' : '#fed7aa'}
        castShadow
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={18}
        minDistance={5}
        maxPolarAngle={Math.PI / 2 - 0.05} // Keep camera above ground
      />

      {/* Asphalt Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[13, 13]} />
        <meshStandardMaterial color="#080e18" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Street Grid Lines */}
      <gridHelper args={[13, 13, '#10b981', '#1e293b']} position={[0, 0.005, 0]} />

      {/* Procedural 3D City Skyline */}
      <ProceduralCity />

      {/* Metric Altitude Ruler */}
      <AltitudeScaleRuler
        boundaryLayerHeightM={boundaryLayerHeightM}
        isInverted={isInverted}
        maxBlhM={maxBlhM}
      />

      {/* Inversion Ceiling Lid */}
      <InversionCeilingLid
        lidHeightY={lidHeightY}
        isInverted={isInverted}
        boundaryLayerHeightM={boundaryLayerHeightM}
      />

      {/* Volumetric Particulate Smoke */}
      <ParticleField
        count={particleConfig.count}
        color={particleConfig.color}
        speed={particleConfig.speed}
        size={particleConfig.size}
        heightRange={[0.2, lidHeightY]}
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
  const [simulationMode, setSimulationMode] = useState<'live' | 'nocturnal' | 'convective'>('live');

  // Determine active parameters based on mode
  const actualInversion = inversionScore >= 50;

  const isInverted =
    simulationMode === 'nocturnal'
      ? true
      : simulationMode === 'convective'
      ? false
      : actualInversion;

  const activeBlh =
    simulationMode === 'nocturnal'
      ? 180
      : simulationMode === 'convective'
      ? 950
      : boundaryLayerHeightM;

  const isNocturnal = simulationMode === 'nocturnal' || (simulationMode === 'live' && actualInversion);

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
          {isInverted ? 'Thermal Inversion Active' : 'Normal Dispersion'}
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
          <span className="font-mono font-medium text-foreground">
            {Math.round(activeBlh)} m
          </span>
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
      title="3D Atmospheric Inversion & Urban Canopy Twin"
      badge={isInverted ? 'INVERSION LID ACTIVE' : 'CONVECTIVE MIXING'}
      fallback2D={fallback2D}
      description="Photorealistic urban digital twin showing boundary-layer compression, particulate trapping, and convective dispersion."
    >
      <div className="relative w-full h-full">
        {/* In-canvas simulation scenario controls */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
          <button
            type="button"
            onClick={() => setSimulationMode('live')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              simulationMode === 'live'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Live Data</span>
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('nocturnal')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              simulationMode === 'nocturnal'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>04:00 AM Inversion Lid</span>
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('convective')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              simulationMode === 'convective'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>02:00 PM Convection</span>
          </button>
        </div>

        {/* Telemetry HUD chip */}
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isInverted ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>{isInverted ? 'LID TRAP ACTIVE' : 'CONVECTIVE'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>BLH: {Math.round(activeBlh)}m</span>
          <span className="text-slate-600">|</span>
          <span>Wind: {windSpeedKmh} km/h</span>
        </div>

        <Canvas
          camera={{ position: [0, 5, 11], fov: 45 }}
          className="w-full h-full"
          shadows
        >
          <InversionSceneContent
            pm25={pm25}
            boundaryLayerHeightM={activeBlh}
            isInverted={isInverted}
            isNocturnal={isNocturnal}
          />
        </Canvas>
      </div>
    </CanvasContainer>
  );
}
