'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Navigation,
  Radio,
  Cpu,
  Wifi,
  Monitor,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { DroneScene } from '@/components/three';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DroneLabPage() {
  const [isDemoRunning, setIsDemoRunning] = React.useState(true);
  const [altitude, setAltitude] = React.useState(45.5);
  const [mq135Trend, setMq135Trend] = React.useState('Elevated');
  const [simulatedRaw, setSimulatedRaw] = React.useState(420);

  // Periodic simulated flight telemetry fluctuations
  React.useEffect(() => {
    if (!isDemoRunning) return;
    const interval = setInterval(() => {
      setAltitude((alt) => Number((Math.max(10, Math.min(100, alt + (Math.random() - 0.5) * 4))).toFixed(1)));
      const raw = Math.round(380 + Math.random() * 80);
      setSimulatedRaw(raw);
      setMq135Trend(raw > 440 ? 'Spike' : raw > 400 ? 'Elevated' : 'Baseline');
    }, 2500);
    return () => clearInterval(interval);
  }, [isDemoRunning]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="space-y-3 pb-4 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Navigation className="h-3.5 w-3.5" />
            Hardware & Aerial Robotics
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-400 font-mono">
            Status: Not Connected
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-xs text-amber-300 font-mono font-bold">
            SIMULATED DEMO
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
            AeroSense Drone Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Vertical atmospheric profiling and microenvironment sampling platform. Captures real-time gas responses, altitude gradients, and boundary-layer inversion trapping above urban canopy layers.
          </p>
        </div>
      </div>

      {/* Hardware Connection & Honesty Banner */}
      <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Hardware Honesty Notice & Prototype Disclosure</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The current physical prototype is built around an <strong>Arduino microcontroller</strong> paired with an <strong>ESP8266 Wi-Fi module</strong>, an <strong>MQ-135 broad-spectrum gas sensor</strong>, and a <strong>temperature/humidity sensor</strong>. The MQ-135 measures relative gas-response trends and <em>never</em> feeds the official Indian CPCB NAQI calculation. Optical particulate counters (PMS5003) and LiDAR are planned future upgrades.
        </p>
      </div>

      {/* 3D Quadcopter UAV Simulation & Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <DroneScene
            altitudeM={altitude}
            mq135Raw={simulatedRaw}
            isConnected={false}
          />
        </div>

        {/* Live Telemetry Display */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-800 bg-[#091118]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-400" />
                  <span>Telemetry HUD</span>
                </CardTitle>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  SIMULATED
                </span>
              </div>
              <CardDescription className="text-xs">
                UAV Flight Telemetry • Node ID: AEROSENSE-UAV-DEMO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Barometric Altitude:</span>
                <span className="font-bold text-cyan-300">{altitude} m AGL</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">MQ-135 Gas Trend:</span>
                <span className={`font-bold ${mq135Trend === 'Spike' ? 'text-red-400' : mq135Trend === 'Elevated' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {mq135Trend} (Raw ADC: {simulatedRaw})
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Battery Level:</span>
                <span className="font-bold text-emerald-400">88%</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Physical Hardware State:</span>
                <span className="font-bold text-slate-400">Not Connected</span>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDemoRunning((v) => !v)}
                  className="w-full text-xs gap-1.5 border-slate-700"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>{isDemoRunning ? 'Pause Stream' : 'Resume Stream'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ingestion API Endpoint Details */}
          <div className="rounded-xl border border-slate-800 p-4 bg-slate-950/50 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block">HTTP Ingestion Endpoint</span>
            <code className="text-[11px] font-mono text-emerald-400 block bg-slate-900 p-2 rounded border border-slate-800 break-all">
              POST /api/drone/ingest
            </code>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Accepts Zod-validated JSON telemetry packets containing coordinates, altitude, PMS5003 readings, and MQ-135 raw ADC.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step System Architecture Flow */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white font-display">
          How AeroSense Drone Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-[#091118] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              1
            </div>
            <h3 className="font-bold text-white">Air-Quality Sensing</h3>
            <p className="text-slate-400 leading-relaxed">
              Drone carries environmental sensors and captures air samples at vertical height slices above urban roads.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#091118] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              2
            </div>
            <h3 className="font-bold text-white">Arduino Processing</h3>
            <p className="text-slate-400 leading-relaxed">
              Onboard microcontroller reads analog sensor pins and formats payload packets.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#091118] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              3
            </div>
            <h3 className="font-bold text-white">Wireless Transmission</h3>
            <p className="text-slate-400 leading-relaxed">
              ESP8266 transmits validated telemetry via Wi-Fi UDP/HTTP telemetry stream.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#091118] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              4
            </div>
            <h3 className="font-bold text-white">Ground Station</h3>
            <p className="text-slate-400 leading-relaxed">
              Receiving ground station logs telemetry and mirrors values on an LCD / local monitor.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#091118] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              5
            </div>
            <h3 className="font-bold text-white">AeroSense AI</h3>
            <p className="text-slate-400 leading-relaxed">
              AeroSense platform ingests validated packets and fuses altitude profiles into the Inversion model.
            </p>
          </div>
        </div>
      </section>

      {/* Hardware Comparison Table: Current Prototype vs Planned Upgrades */}
      <section className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white font-display">
          Hardware Specification & Future Development
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#091118]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-3">Component Category</th>
                <th className="p-3">Current Physical Prototype</th>
                <th className="p-3">Status</th>
                <th className="p-3">Planned Future Upgrades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Processing Unit</td>
                <td className="p-3">Arduino Uno / Nano</td>
                <td className="p-3 text-emerald-400">Active Prototype</td>
                <td className="p-3 text-slate-400">STM32 Flight Controller + Companion Pi</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Wireless Link</td>
                <td className="p-3">ESP8266 (NodeMCU / Wemos) Wi-Fi</td>
                <td className="p-3 text-emerald-400">Active Prototype</td>
                <td className="p-3 text-slate-400">Long-range LoRaWAN (868/915 MHz)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Gas Response</td>
                <td className="p-3">MQ-135 (Relative air quality trend)</td>
                <td className="p-3 text-amber-400">Trend Only (Non-NAQI)</td>
                <td className="p-3 text-slate-400">NDIR CO2 + Electrochemical NO2/SO2</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Particulate Sensor</td>
                <td className="p-3">Simulated Demo Data</td>
                <td className="p-3 text-cyan-400">Planned Hardware</td>
                <td className="p-3 text-slate-400">PMS5003 Laser Optical Particle Counter</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Altitude Reference</td>
                <td className="p-3">Barometric Pressure (BMP280)</td>
                <td className="p-3 text-emerald-400">Active Prototype</td>
                <td className="p-3 text-slate-400">Time-of-Flight (ToF) LiDAR Sensor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
