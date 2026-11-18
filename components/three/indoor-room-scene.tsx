'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasContainer } from './canvas-container';
import { calculateIndoorFlowDynamics, getAqiParticleColor } from './scene-math';

export interface IndoorRoomSceneProps {
  outdoorPm25: number;
  indoorPm25: number;
  roomVolumeM3?: number;
  initialCadrM3h?: number;
}

function PurifierUnit({
  cadrM3h,
  position,
}: {
  cadrM3h: number;
  position: [number, number, number];
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const isActive = cadrM3h > 0;

  useFrame((state) => {
    if (coneRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
      coneRef.current.scale.set(scale, 1, scale);
    }
  });

  return (
    <group position={position}>
      {/* Purifier body */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Top clean air exhaust grille */}
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Clean air exhaust glow cone when running */}
      {isActive && (
        <mesh ref={coneRef} position={[0, 1.6, 0]}>
          <coneGeometry args={[0.7, 1.6, 24, 1, true]} />
          <meshStandardMaterial
            color="#10b981"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <Text position={[0, 0.95, 0]} fontSize={0.16} color="#10b981" anchorX="center">
        {isActive ? `HEPA (${cadrM3h} m³/h)` : 'Purifier (OFF)'}
      </Text>
    </group>
  );
}

function CookingStove({
  isActive,
  position,
}: {
  isActive: boolean;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Countertop */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Burner */}
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
        <meshStandardMaterial color={isActive ? '#ef4444' : '#1e293b'} />
      </mesh>
      {/* Smoke emission glow if active */}
      {isActive && (
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.35, 0.1, 0.9, 16]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.35} />
        </mesh>
      )}
      <Text position={[0, 1.05, 0]} fontSize={0.14} color={isActive ? '#f87171' : '#94a3b8'}>
        {isActive ? 'Active Cooking Smoke' : 'Stove (Idle)'}
      </Text>
    </group>
  );
}

function IndoorAirParticles({
  smokeDensity,
}: {
  smokeDensity: number;
}) {
  const count = Math.round(100 + smokeDensity * 500);
  const color = useMemo(() => getAqiParticleColor(smokeDensity * 300), [smokeDensity]);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return [pos];
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * delta * 0.1;
      if (posArr[i * 3 + 1] > 3.0) posArr[i * 3 + 1] = 0.2;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={Math.min(0.85, 0.3 + smokeDensity * 0.5)}
      />
    </points>
  );
}

function RoomContent({
  windowOpen,
  purifierCadr,
  cookingActive,
}: {
  windowOpen: boolean;
  purifierCadr: number;
  cookingActive: boolean;
}) {
  const { indoorSmokeDensity } = useMemo(
    () => calculateIndoorFlowDynamics(windowOpen, purifierCadr, cookingActive),
    [windowOpen, purifierCadr, cookingActive]
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={12}
        minDistance={4}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Room Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.8} />
      </mesh>

      {/* Left Wall with Window Cutout */}
      <mesh position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.7} />
      </mesh>

      {/* Window Frame */}
      <group position={[-2.95, 1.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 1.2, 0.05]} />
          <meshStandardMaterial
            color={windowOpen ? '#38bdf8' : '#64748b'}
            transparent
            opacity={windowOpen ? 0.2 : 0.6}
          />
        </mesh>
        <Text position={[0, 0.75, 0]} fontSize={0.15} color={windowOpen ? '#38bdf8' : '#94a3b8'}>
          {windowOpen ? 'Window: OPEN (Infiltrating)' : 'Window: SEALED'}
        </Text>
      </group>

      {/* Air Purifier in Room */}
      <PurifierUnit cadrM3h={purifierCadr} position={[1.5, 0, 0.5]} />

      {/* Kitchen Cooking Area */}
      <CookingStove isActive={cookingActive} position={[-1.8, 0, -1.5]} />

      {/* Dynamic PM2.5 Indoor Particle System */}
      <IndoorAirParticles smokeDensity={indoorSmokeDensity} />
    </>
  );
}

export function IndoorRoomScene({
  outdoorPm25,
  indoorPm25,
  roomVolumeM3 = 60,
  initialCadrM3h = 300,
}: IndoorRoomSceneProps) {
  const [windowOpen, setWindowOpen] = useState<boolean>(false);
  const [purifierCadr, setPurifierCadr] = useState<number>(initialCadrM3h);
  const [cookingActive, setCookingActive] = useState<boolean>(false);

  const fallback2D = (
    <div className="w-full max-w-md mx-auto p-5 bg-card/90 rounded-xl border border-border space-y-3.5 text-left text-xs">
      <div className="flex justify-between items-center border-b border-border/60 pb-2">
        <h4 className="font-semibold text-foreground text-sm">Indoor PM2.5 Mass-Balance</h4>
        <span className="text-[11px] font-mono text-muted-foreground">{roomVolumeM3} m³ Room</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Outdoor PM2.5:</span>
          <span className="font-mono text-foreground">{outdoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated Indoor PM2.5:</span>
          <span className="font-mono font-bold text-emerald-400">{indoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Purifier CADR:</span>
          <span className="font-mono text-foreground">{purifierCadr} m³/h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Window Enclosure:</span>
          <span className="font-mono text-foreground">{windowOpen ? 'Open (High Infiltration)' : 'Sealed'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cooking Emission Source:</span>
          <span className="font-mono text-foreground">{cookingActive ? 'Active Frying Plume' : 'Idle'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CanvasContainer
      title="3D Indoor PM2.5 Microenvironment Model"
      badge={`${purifierCadr > 0 ? 'PURIFIER RUNNING' : 'UNFILTERED'}`}
      fallback2D={fallback2D}
      description="Interactive mass-balance simulator: test window sealing, cooking emissions, and HEPA CADR airflow."
    >
      <div className="relative w-full h-full">
        {/* Interactive Controls Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 bg-background/85 backdrop-blur-md p-1.5 rounded-lg border border-border/70 text-xs">
          <button
            type="button"
            onClick={() => setWindowOpen((v) => !v)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              windowOpen ? 'bg-sky-600 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            Window: {windowOpen ? 'OPEN' : 'SEALED'}
          </button>

          <button
            type="button"
            onClick={() => setCookingActive((v) => !v)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              cookingActive ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            Cooking: {cookingActive ? 'ON' : 'OFF'}
          </button>

          <select
            value={purifierCadr}
            onChange={(e) => setPurifierCadr(Number(e.target.value))}
            className="bg-card text-foreground px-2 py-1 rounded border border-border text-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value={0}>Purifier: OFF</option>
            <option value={150}>Purifier: Low (150 m³/h)</option>
            <option value={300}>Purifier: Auto (300 m³/h)</option>
            <option value={500}>Purifier: Max (500 m³/h)</option>
          </select>
        </div>

        <Canvas camera={{ position: [4, 4, 6], fov: 42 }} className="w-full h-full">
          <RoomContent
            windowOpen={windowOpen}
            purifierCadr={purifierCadr}
            cookingActive={cookingActive}
          />
        </Canvas>
      </div>
    </CanvasContainer>
  );
}
