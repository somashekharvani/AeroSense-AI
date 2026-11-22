'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasContainer } from './canvas-container';
import { calculateIndoorFlowDynamics, getAqiParticleColor } from './scene-math';
import { Wind, Flame, Eye, Sparkles } from 'lucide-react';

export interface IndoorRoomSceneProps {
  outdoorPm25: number;
  indoorPm25: number;
  roomVolumeM3?: number;
  initialCadrM3h?: number;
  windowOpen?: boolean;
  onWindowOpenChange?: (open: boolean) => void;
  cadrM3h?: number;
  onCadrChange?: (cadr: number) => void;
  cookingActive?: boolean;
  onCookingChange?: (active: boolean) => void;
}

// 3D HEPA Air Purifier with cylindrical body, filter mesh intake, and vortex exhaust cone
function PurifierUnit({
  cadrM3h,
  position,
}: {
  cadrM3h: number;
  position: [number, number, number];
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const isActive = cadrM3h > 0;

  useFrame((state, delta) => {
    if (coneRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
      coneRef.current.scale.set(scale, 1, scale);
      coneRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current && isActive) {
      ringRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Purifier Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.1, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Perforated Filter Mesh Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.7, 24]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Top Exhaust Grille */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.04, 24]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>

      {/* LED Status Ring */}
      <mesh ref={ringRef} position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 24]} />
        <meshStandardMaterial
          color={isActive ? '#10b981' : '#64748b'}
          emissive={isActive ? '#059669' : '#334155'}
          emissiveIntensity={isActive ? 1.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Clean Air Vortex Flow Cone when active */}
      {isActive && (
        <group position={[0, 1.6, 0]}>
          <mesh ref={coneRef}>
            <coneGeometry args={[0.65, 1.5, 24, 1, true]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.4}
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* CADR Label */}
      <Text
        position={[0, 0.98, 0]}
        fontSize={0.14}
        color={isActive ? '#34d399' : '#94a3b8'}
        anchorX="center"
        anchorY="bottom"
      >
        {isActive ? `HEPA (${cadrM3h} m³/h)` : 'Purifier (OFF)'}
      </Text>
    </group>
  );
}

// Kitchen Corner with Stovetop and Smoke Dispersion
function CookingStove({
  isActive,
  position,
}: {
  isActive: boolean;
  position: [number, number, number];
}) {
  const smokeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (smokeRef.current && isActive) {
      smokeRef.current.rotation.y += delta * 0.5;
      const wobble = Math.sin(state.clock.elapsedTime * 2.5) * 0.05;
      smokeRef.current.position.x = wobble;
    }
  });

  return (
    <group position={position}>
      {/* Countertop */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.84, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Granite Slab Surface */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.34, 0.04, 0.94]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Stove Burner Ring */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 20]} />
        <meshStandardMaterial
          color={isActive ? '#ef4444' : '#334155'}
          emissive={isActive ? '#b91c1c' : '#000000'}
          emissiveIntensity={isActive ? 1.2 : 0}
        />
      </mesh>

      {/* Frying Pan */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 0.06, 20]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Active Cooking Smoke Plume */}
      {isActive && (
        <group position={[0, 1.45, 0]}>
          <mesh ref={smokeRef}>
            <cylinderGeometry args={[0.35, 0.12, 1.0, 16]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#ea580c"
              emissiveIntensity={0.5}
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      <Text
        position={[0, 1.08, 0]}
        fontSize={0.13}
        color={isActive ? '#f87171' : '#94a3b8'}
        anchorX="center"
        anchorY="bottom"
      >
        {isActive ? 'Stove: Active Combustion' : 'Stove: Idle'}
      </Text>
    </group>
  );
}

// Furniture: Living Room Sofa & Coffee Table
function LivingRoomFurniture() {
  return (
    <group position={[0.2, 0, -0.6]}>
      {/* Couch Base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[2.0, 0.44, 0.85]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Couch Backrest */}
      <mesh position={[0, 0.65, -0.32]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Couch Cushions */}
      <mesh position={[-0.48, 0.46, 0.05]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.65]} />
        <meshStandardMaterial color="#0f766e" roughness={0.8} />
      </mesh>
      <mesh position={[0.48, 0.46, 0.05]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.65]} />
        <meshStandardMaterial color="#0f766e" roughness={0.8} />
      </mesh>

      {/* Coffee Table */}
      <mesh position={[0, 0.2, 0.95]} castShadow>
        <boxGeometry args={[1.2, 0.38, 0.55]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

// Dynamic PM2.5 particulate haze within the room
function IndoorAirParticles({
  smokeDensity,
  indoorPm25,
}: {
  smokeDensity: number;
  indoorPm25: number;
}) {
  const count = Math.round(120 + smokeDensity * 550);
  const color = useMemo(() => getAqiParticleColor(indoorPm25), [indoorPm25]);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5.2;
      pos[i * 3 + 1] = 0.25 + Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
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
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * delta * 0.08;
      if (posArr[i * 3 + 1] > 2.85) posArr[i * 3 + 1] = 0.25;
      if (posArr[i * 3 + 1] < 0.25) posArr[i * 3 + 1] = 2.85;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={color}
        transparent
        opacity={Math.min(0.85, 0.25 + smokeDensity * 0.5)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function RoomContent({
  windowOpen,
  purifierCadr,
  cookingActive,
  indoorPm25,
}: {
  windowOpen: boolean;
  purifierCadr: number;
  cookingActive: boolean;
  indoorPm25: number;
}) {
  const { indoorSmokeDensity } = useMemo(
    () => calculateIndoorFlowDynamics(windowOpen, purifierCadr, cookingActive),
    [windowOpen, purifierCadr, cookingActive]
  );

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.1}
        color="#fed7aa"
        castShadow
      />
      {windowOpen && (
        <directionalLight
          position={[-7, 4, 0]}
          intensity={0.8}
          color="#38bdf8"
        />
      )}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={12}
        minDistance={4}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Room Floor (Dark parquet styling) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6.2, 5.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Floor Grid Lines */}
      <gridHelper args={[6.2, 10, '#047857', '#1e293b']} position={[0, 0.005, 0]} />

      {/* Back Wall */}
      <mesh position={[0, 1.5, -2.6]} receiveShadow>
        <planeGeometry args={[6.2, 3]} />
        <meshStandardMaterial color="#080f1a" transparent opacity={0.85} />
      </mesh>

      {/* Left Wall with Window Cutout */}
      <mesh position={[-3.1, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.2, 3]} />
        <meshStandardMaterial color="#080f1a" transparent opacity={0.75} />
      </mesh>

      {/* Architectural Window Frame */}
      <group position={[-3.05, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Frame Outer */}
        <mesh>
          <boxGeometry args={[1.8, 1.3, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Glass Pane */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.65, 1.15]} />
          <meshStandardMaterial
            color={windowOpen ? '#38bdf8' : '#64748b'}
            transparent
            opacity={windowOpen ? 0.2 : 0.65}
            roughness={0.1}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color={windowOpen ? '#38bdf8' : '#94a3b8'}
          anchorX="center"
          anchorY="bottom"
        >
          {windowOpen ? 'Window: OPEN (High Infiltration)' : 'Window: SEALED (Low Infiltration)'}
        </Text>
      </group>

      {/* Living Room Furniture */}
      <LivingRoomFurniture />

      {/* Air Purifier in Room */}
      <PurifierUnit cadrM3h={purifierCadr} position={[1.8, 0, 0.8]} />

      {/* Kitchen Cooking Area */}
      <CookingStove isActive={cookingActive} position={[-1.9, 0, -1.6]} />

      {/* Dynamic PM2.5 Indoor Particle System */}
      <IndoorAirParticles smokeDensity={indoorSmokeDensity} indoorPm25={indoorPm25} />
    </>
  );
}

export function IndoorRoomScene({
  outdoorPm25,
  indoorPm25,
  roomVolumeM3 = 60,
  initialCadrM3h = 300,
  windowOpen: controlledWindowOpen,
  onWindowOpenChange,
  cadrM3h: controlledCadr,
  onCadrChange,
  cookingActive: controlledCooking,
  onCookingChange,
}: IndoorRoomSceneProps) {
  // Support both controlled props (from parent page) and uncontrolled state
  const [internalWindow, setInternalWindow] = useState<boolean>(false);
  const [internalCadr, setInternalCadr] = useState<number>(initialCadrM3h);
  const [internalCooking, setInternalCooking] = useState<boolean>(false);

  const windowOpen = controlledWindowOpen !== undefined ? controlledWindowOpen : internalWindow;
  const cadrM3h = controlledCadr !== undefined ? controlledCadr : internalCadr;
  const cookingActive = controlledCooking !== undefined ? controlledCooking : internalCooking;

  const setWindowOpen = (val: boolean) => {
    if (onWindowOpenChange) onWindowOpenChange(val);
    else setInternalWindow(val);
  };

  const setCadr = (val: number) => {
    if (onCadrChange) onCadrChange(val);
    else setInternalCadr(val);
  };

  const setCooking = (val: boolean) => {
    if (onCookingChange) onCookingChange(val);
    else setInternalCooking(val);
  };

  const fallback2D = (
    <div className="w-full max-w-md mx-auto p-5 bg-card/90 rounded-xl border border-border space-y-3.5 text-left text-xs">
      <div className="flex justify-between items-center border-b border-border/60 pb-2">
        <h4 className="font-semibold text-foreground text-sm">Indoor PM2.5 Mass-Balance</h4>
        <span className="text-[11px] font-mono text-muted-foreground">{roomVolumeM3} m³ Space</span>
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
          <span className="font-mono text-foreground">{cadrM3h} m³/h</span>
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
      badge={`${cadrM3h > 0 ? 'PURIFIER RUNNING' : 'UNFILTERED'}`}
      fallback2D={fallback2D}
      description="Interactive mass-balance simulator: test window sealing, cooking emissions, and HEPA CADR airflow."
    >
      <div className="relative w-full h-full">
        {/* Interactive Controls Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
          <button
            type="button"
            onClick={() => setWindowOpen(!windowOpen)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              windowOpen ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Window: {windowOpen ? 'OPEN' : 'SEALED'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCooking(!cookingActive)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              cookingActive ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Cooking: {cookingActive ? 'ON' : 'OFF'}</span>
          </button>

          <select
            value={cadrM3h}
            onChange={(e) => setCadr(Number(e.target.value))}
            className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value={0}>Purifier: OFF</option>
            <option value={150}>Purifier: Low (150 m³/h)</option>
            <option value={300}>Purifier: Auto (300 m³/h)</option>
            <option value={500}>Purifier: Max (500 m³/h)</option>
          </select>
        </div>

        {/* Live Indoor Mass-Balance HUD chip */}
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                indoorPm25 <= 30
                  ? 'bg-emerald-400'
                  : indoorPm25 <= 60
                  ? 'bg-lime-400'
                  : indoorPm25 <= 90
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span>Indoor: <strong>{indoorPm25} µg/m³</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <span>Outdoor: {outdoorPm25} µg/m³</span>
          <span className="text-slate-600">|</span>
          <span>Vol: {roomVolumeM3} m³</span>
        </div>

        <Canvas camera={{ position: [4, 4, 6], fov: 42 }} className="w-full h-full" shadows>
          <RoomContent
            windowOpen={windowOpen}
            purifierCadr={cadrM3h}
            cookingActive={cookingActive}
            indoorPm25={indoorPm25}
          />
        </Canvas>
      </div>
    </CanvasContainer>
  );
}
