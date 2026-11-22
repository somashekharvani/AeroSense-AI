'use client';

import * as React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Flame,
  Radio,
  Wind,
  Compass,
  RotateCcw,
  Info,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAQICategory } from '@/components/ui/aqi-badge';
import { getAqiParticleColor } from '@/components/three/scene-math';
import { IncidentViewResult } from '@/engines/incident';
import { SnapshotData } from '@/hooks/use-snapshot';

export interface PollutionMapProps {
  center: { lat: number; lon: number };
  snapshot?: SnapshotData | null;
  className?: string;
}

// Generate geodesic points for downwind plume wedge
function generatePlumeWedgeCoordinates(
  lat: number,
  lon: number,
  bearingDeg: number,
  spreadDeg: number,
  distanceKm: number = 25
): [number, number][] {
  const coords: [number, number][] = [[lon, lat]];
  const R = 6371; // Earth radius in km
  const d = distanceKm / R;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const startAngle = bearingDeg - spreadDeg;
  const endAngle = bearingDeg + spreadDeg;
  const steps = 12;

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const brng = (angle * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );

    coords.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  coords.push([lon, lat]); // Close polygon
  return coords;
}

export function PollutionMap({
  center,
  snapshot,
  className,
}: PollutionMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

  const [showPlume, setShowPlume] = React.useState(true);
  const [showFires, setShowFires] = React.useState(true);
  const [showStations, setShowStations] = React.useState(true);
  const [is3D, setIs3D] = React.useState(true);

  const incident = snapshot?.incidentView;
  const atmosphere = snapshot?.atmosphere;
  const aqiData = snapshot?.indianAqi;

  // Initialize MapLibre GL
  React.useEffect(() => {
    if (!mapContainer.current) return;

    // Dark raster style using CartoDB Dark Matter tiles
    const darkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkStyle,
      center: [center.lon, center.lat],
      zoom: 11,
      pitch: 45,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // 1. User Center Marker
      const centerEl = document.createElement('div');
      centerEl.className = 'center-pin-marker';
      centerEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
        </div>
      `;
      new maplibregl.Marker({ element: centerEl })
        .setLngLat([center.lon, center.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 6px; font-family: sans-serif; color: #f8fafc; background: #0f172a; border-radius: 6px; font-size: 11px;">
              <strong style="color: #10b981;">Selected Location</strong><br/>
              ${center.lat.toFixed(2)}°N, ${center.lon.toFixed(2)}°E<br/>
              <span style="color: #94a3b8;">CPCB AQI: <strong>${aqiData?.aqi ?? '--'}</strong></span>
            </div>
          `)
        )
        .addTo(map);

      // 2. Downwind Smoke Dispersion Wedge Layer
      if (incident?.downwindSector) {
        const bearing = incident.downwindSector.downwindBearingDeg;
        const spread = incident.downwindSector.spreadAngleDeg;
        const wedgeCoordinates = generatePlumeWedgeCoordinates(
          center.lat,
          center.lon,
          bearing,
          spread,
          25
        );

        map.addSource('downwind-plume-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [wedgeCoordinates],
            },
            properties: {
              title: 'Downwind Smoke Plume Estimate',
              bearing,
              spread,
            },
          },
        });

        map.addLayer({
          id: 'downwind-plume-fill',
          type: 'fill',
          source: 'downwind-plume-source',
          paint: {
            'fill-color': '#f59e0b',
            'fill-opacity': 0.22,
          },
        });

        map.addLayer({
          id: 'downwind-plume-line',
          type: 'line',
          source: 'downwind-plume-source',
          paint: {
            'line-color': '#fbbf24',
            'line-width': 2,
            'line-dasharray': [3, 2],
          },
        });

        // Plume click popup
        map.on('click', 'downwind-plume-fill', (e) => {
          new maplibregl.Popup({ offset: 10 })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="padding: 8px; font-family: sans-serif; color: #f8fafc; background: #0f172a; border-radius: 8px; font-size: 11px; max-width: 220px;">
                <div style="display: flex; align-items: center; gap: 4px; color: #fbbf24; font-weight: bold; margin-bottom: 4px;">
                  <span>⚠️ Plume Trajectory (ESTIMATE)</span>
                </div>
                <p style="margin: 0; color: #cbd5e1; font-size: 10px; line-height: 1.4;">
                  Modeled \(\pm${spread}^\circ\) downwind dispersion cone along ${bearing}° bearing at ${atmosphere?.windSpeedKmh ?? 5} km/h. Downwind areas are scientific projections, not ground confirmations.
                </p>
              </div>
            `)
            .addTo(map);
        });
      }

      // 3. Ground Stations in Downwind Sector & Nearby
      if (incident?.stationsInDownwindSector) {
        incident.stationsInDownwindSector.forEach((station) => {
          const aqi = station.aqi ?? 100;
          const color = getAqiParticleColor(aqi);

          const stationEl = document.createElement('div');
          stationEl.className = 'station-marker';
          stationEl.innerHTML = `
            <div style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #091118; border: 2px solid ${color}; box-shadow: 0 0 8px ${color}80; color: ${color}; font-weight: bold; font-size: 10px; font-family: monospace;">
              ${aqi}
            </div>
          `;

          new maplibregl.Marker({ element: stationEl })
            .setLngLat([station.lon, station.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 15 }).setHTML(`
                <div style="padding: 6px; font-family: sans-serif; color: #f8fafc; background: #0f172a; border-radius: 6px; font-size: 11px;">
                  <strong style="color: ${color};">${station.stationName}</strong><br/>
                  CPCB AQI: <strong>${aqi}</strong> (${getAQICategory(aqi)})<br/>
                  Distance: ${station.distanceKm?.toFixed(1) ?? '--'} km<br/>
                  Dominant: ${(station.dominantPollutant || 'PM2.5').toUpperCase()}
                </div>
              `)
            )
            .addTo(map);
        });
      }

      // 4. NASA FIRMS Active Thermal Detections
      if (incident?.nearbyThermalDetections) {
        incident.nearbyThermalDetections.forEach((fire) => {
          const fireEl = document.createElement('div');
          fireEl.className = 'fire-marker';
          fireEl.innerHTML = `
            <div style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); border: 1.5px solid #f59e0b;">
              <span style="font-size: 13px;">🔥</span>
            </div>
          `;

          new maplibregl.Marker({ element: fireEl })
            .setLngLat([fire.longitude, fire.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 15 }).setHTML(`
                <div style="padding: 6px; font-family: sans-serif; color: #f8fafc; background: #0f172a; border-radius: 6px; font-size: 11px; max-width: 200px;">
                  <strong style="color: #fbbf24;">NASA VIIRS Hotspot</strong><br/>
                  FRP: <strong>${fire.frpMw} MW</strong><br/>
                  Distance: ${fire.distanceKm.toFixed(1)} km (${fire.bearingDeg}°)<br/>
                  Satellite: ${fire.satellite}<br/>
                  <span style="color: #94a3b8; font-size: 9px;">Thermal detection only. Plume impact labeled ESTIMATE.</span>
                </div>
              `)
            )
            .addTo(map);
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lon, incident, atmosphere, aqiData]);

  // Layer Visibility Toggles
  React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer('downwind-plume-fill')) {
      map.setLayoutProperty(
        'downwind-plume-fill',
        'visibility',
        showPlume ? 'visible' : 'none'
      );
    }
    if (map.getLayer('downwind-plume-line')) {
      map.setLayoutProperty(
        'downwind-plume-line',
        'visibility',
        showPlume ? 'visible' : 'none'
      );
    }

    const fireMarkers = document.querySelectorAll('.fire-marker');
    fireMarkers.forEach((el) => {
      (el as HTMLElement).style.display = showFires ? 'flex' : 'none';
    });

    const stationMarkers = document.querySelectorAll('.station-marker');
    stationMarkers.forEach((el) => {
      (el as HTMLElement).style.display = showStations ? 'flex' : 'none';
    });
  }, [showPlume, showFires, showStations]);

  // Toggle 3D / 2D Pitch
  const togglePitch = () => {
    if (!mapRef.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    mapRef.current.easeTo({
      pitch: next3D ? 45 : 0,
      duration: 800,
    });
  };

  // Recenter map
  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [center.lon, center.lat],
      zoom: 11,
      pitch: is3D ? 45 : 0,
      duration: 1000,
    });
  };

  return (
    <div
      className={`relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${
        className || ''
      }`}
    >
      {/* MapLibre DOM Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
        <button
          type="button"
          onClick={() => setShowPlume(!showPlume)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            showPlume
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Toggle downwind plume overlay"
        >
          <Wind className="h-3.5 w-3.5" />
          <span>Plume Cone (ESTIMATE)</span>
        </button>

        <button
          type="button"
          onClick={() => setShowStations(!showStations)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            showStations
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Toggle ground stations"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Stations</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFires(!showFires)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            showFires
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Toggle NASA FIRMS fire points"
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Hotspots ({incident?.nearbyThermalDetections.length ?? 0})</span>
        </button>
      </div>

      {/* Right Map Actions (3D Toggle & Recenter) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
        <button
          type="button"
          onClick={togglePitch}
          className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            is3D
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle 3D Perspective Pitch"
          aria-label="Toggle 3D Perspective"
        >
          {is3D ? '3D' : '2D'}
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Recenter on Selected Coordinates"
          aria-label="Recenter map"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-lg">
        <span className="text-[10px] uppercase font-bold text-slate-400">AQI Scale:</span>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" title="Good (0-50)" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]" title="Satisfactory (51-100)" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" title="Moderate (101-200)" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" title="Poor (201-300)" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" title="Very Poor (301-400)" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#9333ea]" title="Severe (401-500)" />
        </div>
        <span className="text-slate-600">|</span>
        <Badge
          variant="outline"
          className="border-amber-800/80 bg-amber-950/60 text-amber-300 text-[9px] font-mono"
        >
          PLUMES ARE ESTIMATES
        </Badge>
      </div>
    </div>
  );
}
