'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AQIBadge, type AQICategory } from '@/components/ui/aqi-badge';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { getAqiParticleColor } from '@/components/three/scene-math';
import { Sparkles, Eye, RotateCw, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroCitySceneProps {
  cityName: string;
  aqi?: number;
  category?: AQICategory;
  pm25?: number;
  dominantPollutant?: string;
  boundaryLayerHeightM?: number;
  lastUpdated?: string;
}

// Procedural building generator with architectural setbacks and emissive window grids
interface BuildingData {
  id: number;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  hasSpire: boolean;
  hasPodium: boolean;
  windowHue: string;
}

function generateProceduralCity(): BuildingData[] {
  const buildings: BuildingData[] = [];
  const palette = ['#1e293b', '#182234', '#131c2b', '#0f172a', '#243048', '#1a2638'];
  const windowHues = ['#38bdf8', '#34d399', '#f59e0b', '#818cf8'];

  let id = 0;
  // Create a 7x7 city grid with street avenues (gaps at x=0 and z=0 for main boulevard)
  for (let gx = -3; gx <= 3; gx++) {
    for (let gz = -3; gz <= 3; gz++) {
      // Reserve center for civic plaza / ground monitoring station
      if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1 && Math.random() > 0.4) {
        continue;
      }

      // Add building clusters with street offset
      const avenueGap = 0.6;
      const x = gx * 2.2 + (gx > 0 ? avenueGap : -avenueGap);
      const z = gz * 2.2 + (gz > 0 ? avenueGap : -avenueGap);

      // Height distribution: taller in central financial core, tapering outward
      const distFromCenter = Math.sqrt(gx * gx + gz * gz);
      const baseHeight = Math.max(1.4, 6.5 - distFromCenter * 1.1 + (Math.sin(id * 1.7) * 1.5));
      const width = 1.1 + (Math.sin(id * 3.1) * 0.35);
      const depth = 1.1 + (Math.cos(id * 2.9) * 0.35);
      const color = palette[Math.abs(id) % palette.length];
      const windowHue = windowHues[Math.abs(id) % windowHues.length];
      const hasSpire = baseHeight > 4.5 && id % 3 === 0;
      const hasPodium = baseHeight > 3.0;

      buildings.push({
        id: id++,
        x,
        z,
        width,
        depth,
        height: baseHeight,
        color,
        hasSpire,
        hasPodium,
        windowHue,
      });
    }
  }

  return buildings;
}

// Single architectural building with realistic facade & rooftop detail
function ArchitecturalBuilding({ b }: { b: BuildingData }) {
  return (
    <group position={[b.x, 0, b.z]}>
      {/* Podium base if tall building */}
      {b.hasPodium && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[b.width * 1.25, 0.8, b.depth * 1.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
        </mesh>
      )}

      {/* Main Building Body */}
      <mesh position={[0, b.height / 2, 0]}>
        <boxGeometry args={[b.width, b.height, b.depth]} />
        <meshStandardMaterial
          color={b.color}
          roughness={0.3}
          metalness={0.65}
        />
      </mesh>

      {/* Glass facade trim / illuminated window stripes */}
      <mesh position={[0, b.height / 2, b.depth / 2 + 0.01]}>
        <planeGeometry args={[b.width * 0.8, b.height * 0.85]} />
        <meshStandardMaterial
          color={b.windowHue}
          emissive={b.windowHue}
          emissiveIntensity={0.25}
          roughness={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0, b.height / 2, -b.depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[b.width * 0.8, b.height * 0.85]} />
        <meshStandardMaterial
          color={b.windowHue}
          emissive={b.windowHue}
          emissiveIntensity={0.25}
          roughness={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Rooftop HVAC mechanical penthouse */}
      <mesh position={[0, b.height + 0.2, 0]}>
        <boxGeometry args={[b.width * 0.5, 0.4, b.depth * 0.5]} />
        <meshStandardMaterial color="#0b111e" roughness={0.9} />
      </mesh>

      {/* Rooftop communication spire */}
      {b.hasSpire && (
        <mesh position={[0, b.height + 0.9, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
}

// Volumetric atmospheric particulate smog layer
function AtmosphericHaze({ aqi = 85, pm25 = 50 }: { aqi?: number; pm25?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = useMemo(() => Math.min(350, Math.max(120, Math.round(pm25 * 3))), [pm25]);
  const particleColor = useMemo(() => getAqiParticleColor(aqi), [aqi]);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    return [pos];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle wind transport drift along X axis
      posArr[i * 3] += delta * 0.35;
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.8 + i) * delta * 0.05;

      // Wrap-around boundary
      if (posArr[i * 3] > 11) posArr[i * 3] = -11;
      if (posArr[i * 3 + 1] > 5.5) posArr[i * 3 + 1] = 0.5;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={particleColor}
        transparent
        opacity={Math.min(0.7, 0.25 + (pm25 / 250) * 0.45)}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D City Scene Container
function CitySceneContent({
  aqi,
  pm25,
  autoRotate,
}: {
  aqi?: number;
  pm25?: number;
  autoRotate: boolean;
}) {
  const buildings = useMemo(() => generateProceduralCity(), []);

  return (
    <>
      {/* Fog for atmospheric depth */}
      <color attach="background" args={['#05080c']} />
      <fog attach="fog" args={['#05080c', 14, 28]} />

      {/* Directional Golden Sunlight & Sky Lighting */}
      <ambientLight intensity={0.4} color="#0f172a" />
      <directionalLight
        position={[20, 24, 16]}
        intensity={1.6}
        color="#fed7aa"
        castShadow={false}
      />
      {/* Subtle Cyan Counter-Fill Light */}
      <directionalLight position={[-16, 12, -14]} intensity={0.5} color="#38bdf8" />

      {/* Ground Asphalt Plane with Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#080d16" roughness={0.9} />
      </mesh>
      <gridHelper args={[26, 26, '#10b981', '#172554']} position={[0, 0.01, 0]} />

      {/* Central Civic Sensor Station Beacon */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 0.5, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Architectural City Buildings */}
      {buildings.map((b) => (
        <ArchitecturalBuilding key={b.id} b={b} />
      ))}

      {/* Atmospheric Particulate Haze */}
      <AtmosphericHaze aqi={aqi} pm25={pm25} />

      {/* Camera Orbit Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={22}
        minDistance={9}
        maxPolarAngle={Math.PI / 2 - 0.12} // Constrain above horizon
        minPolarAngle={Math.PI / 4}
        autoRotate={autoRotate}
        autoRotateSpeed={0.65}
      />
    </>
  );
}

export function HeroCityScene({
  cityName,
  aqi = 85,
  category = 'Satisfactory',
  pm25 = 52.4,
  dominantPollutant = 'PM2.5',
  boundaryLayerHeightM = 380,
  lastUpdated,
}: HeroCitySceneProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden border border-emerald-900/30 bg-[#05080c] shadow-2xl">
      {hasWebGL ? (
        <Canvas
          camera={{ position: [11, 10, 14], fov: 42 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <CitySceneContent aqi={aqi} pm25={pm25} autoRotate={autoRotate} />
        </Canvas>
      ) : (
        /* Accessible 2D Fallback for Non-WebGL Devices */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c151c] to-[#05080c] p-6 text-center">
          <div className="max-w-md space-y-3">
            <h3 className="text-xl font-bold text-white font-display">Urban Atmospheric Digital Twin</h3>
            <p className="text-xs text-slate-400">
              Interactive 3D acceleration is not available in your browser. Live telemetry data for {cityName} remains fully operational below.
            </p>
          </div>
        </div>
      )}

      {/* Floating Live Telemetry Chip (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <div className="rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 p-3.5 shadow-xl max-w-[270px] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Urban Twin
            </span>
            <span className="text-[10px] font-mono text-slate-400 truncate">
              {cityName}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Indian CPCB AQI</span>
              <AQIBadge aqi={aqi} category={category} size="md" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-0.5">Dominant</span>
              <span className="text-xs font-bold font-mono text-white">{dominantPollutant}</span>
              <span className="text-[10px] font-mono text-slate-400 block">{pm25.toFixed(1)} µg/m³</span>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Boundary Layer: <strong className="text-slate-200 font-mono">{Math.round(boundaryLayerHeightM)}m</strong></span>
            {lastUpdated && <span className="font-mono text-[9px]">{lastUpdated}</span>}
          </div>
        </div>
      </div>

      {/* Camera Control Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 text-xs text-slate-300">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          title="Toggle camera auto-rotation"
        >
          <RotateCw className={cn('h-3.5 w-3.5', autoRotate && 'text-emerald-400')} />
          <span className="text-[11px]">{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
        <span className="text-slate-700">|</span>
        <span className="text-[10px] text-slate-400">Drag to orbit</span>
      </div>

      {/* Atmospheric Horizon Gradient Vignette */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#05080c] via-[#05080c]/60 to-transparent pointer-events-none" />
    </div>
  );
}
