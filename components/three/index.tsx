'use client';

import dynamic from 'next/dynamic';

export const AtmosphereScene = dynamic(
  () => import('./atmosphere-scene').then((mod) => mod.AtmosphereScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] md:h-[450px] rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground border border-border">
        Loading 3D Atmospheric Inversion Scene...
      </div>
    ),
  }
);

export const IndoorRoomScene = dynamic(
  () => import('./indoor-room-scene').then((mod) => mod.IndoorRoomScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] md:h-[450px] rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground border border-border">
        Loading 3D Indoor Microenvironment Scene...
      </div>
    ),
  }
);

export const DroneScene = dynamic(
  () => import('./drone-scene').then((mod) => mod.DroneScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] md:h-[450px] rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground border border-border">
        Loading 3D Drone Scene...
      </div>
    ),
  }
);

export * from './scene-math';
export * from './canvas-container';
