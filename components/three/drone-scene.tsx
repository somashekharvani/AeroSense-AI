'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasContainer } from './canvas-container';

export interface DroneSceneProps {
  altitudeM?: number;
  simulatedPm25?: number;
  mq135Raw?: number;
  isConnected?: boolean;
}

function Propeller({
  position,
  spinSpeed = 25,
}: {
  position: [number, number, number];
  spinSpeed?: number;
}) {
  const propRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (propRef.current) {
      propRef.current.rotation.y += delta * spinSpeed;
    }
  });

  return (
    <group position={position}>
      {/* Motor hub */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Spinning blade pair */}
      <group ref={propRef} position={[0, 0.16, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.02, 0.06]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function QuadcopterDrone() {
  const armLength = 0.9;
  const armOffset = Math.sin(Math.PI / 4) * armLength;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, 0.5, 0]}>
        {/* Central Fuselage Hub */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.16, 0.45]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Status LED Dome */}
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </mesh>

        {/* 4 Carbon Arms */}
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[1.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>

        {/* 4 Propeller Units */}
        <Propeller position={[armOffset, 0, armOffset]} spinSpeed={30} />
        <Propeller position={[-armOffset, 0, armOffset]} spinSpeed={-30} />
        <Propeller position={[armOffset, 0, -armOffset]} spinSpeed={-30} />
        <Propeller position={[-armOffset, 0, -armOffset]} spinSpeed={30} />

        {/* Sensor Probe Optical Pod */}
        <mesh position={[0, -0.14, 0.1]}>
          <cylinderGeometry args={[0.06, 0.08, 0.14, 16]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Downward Laser Probe Sensor Scan Beam */}
        <mesh position={[0, -1.2, 0.1]}>
          <coneGeometry args={[0.8, 2.0, 24, 1, true]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text position={[0, 0.35, 0]} fontSize={0.14} color="#38bdf8" anchorX="center">
          AeroSense Drone v1 (ESP8266)
        </Text>
      </group>
    </Float>
  );
}

export function DroneScene({
  altitudeM = 45,
  simulatedPm25 = 118,
  mq135Raw = 410,
  isConnected = false,
}: DroneSceneProps) {
  const [flightSpeed, setFlightSpeed] = useState<number>(3.5);

  const fallback2D = (
    <div className="w-full max-w-md mx-auto p-5 bg-card/90 rounded-xl border border-border space-y-3.5 text-left text-xs">
      <div className="flex justify-between items-center border-b border-border/60 pb-2">
        <h4 className="font-semibold text-foreground text-sm">AeroSense Drone Telemetry</h4>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {isConnected ? 'LIVE TELEMETRY' : 'SIMULATED DEMO'}
        </span>
      </div>

      <div className="space-y-1.5 font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-sans">Flight Altitude:</span>
          <span className="text-foreground">{altitudeM} m AGL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-sans">PMS5003 PM2.5 Sensor:</span>
          <span className="text-emerald-400 font-bold">{simulatedPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-sans">MQ135 Gas Trend (Relative):</span>
          <span className="text-foreground">{mq135Raw} ADC counts</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-sans">Microcontroller Link:</span>
          <span className="text-foreground">ESP8266 Wi-Fi / NGINX Ingestion</span>
        </div>
      </div>

      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
        Notice: MQ135 ADC readings represent relative gas response trend only and never feed the CPCB NAQI formula.
      </div>
    </div>
  );

  return (
    <CanvasContainer
      title="3D AeroSense Drone Flight & Sensor Probe"
      badge={isConnected ? 'CONNECTED' : 'SIMULATED DEMO'}
      fallback2D={fallback2D}
      description="Interactive 3D model of our hardware drone probe measuring vertical boundary layer gradients."
    >
      <div className="relative w-full h-full">
        {/* Floating Telemetry HUD */}
        <div className="absolute top-3 left-3 z-10 bg-background/85 backdrop-blur-md p-2 rounded-lg border border-border/70 text-xs font-mono space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            [SIMULATED FLIGHT TELEMETRY]
          </div>
          <div className="text-foreground text-[11px]">ALT: {altitudeM}m AGL | SPD: {flightSpeed}m/s</div>
          <div className="text-emerald-400 text-[11px]">PMS5003 PM2.5: {simulatedPm25} µg/m³</div>
          <div className="text-muted-foreground text-[10px]">MQ135 Gas Trend: {mq135Raw} (Trend only)</div>
        </div>

        <Canvas camera={{ position: [0, 2, 4], fov: 45 }} className="w-full h-full">
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} />
          <pointLight position={[0, -0.5, 0]} color="#38bdf8" intensity={2} distance={3} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxDistance={8}
            minDistance={2}
          />

          <QuadcopterDrone />
          <gridHelper args={[10, 10, '#38bdf8', '#1e293b']} position={[0, -1.8, 0]} />
        </Canvas>
      </div>
    </CanvasContainer>
  );
}
