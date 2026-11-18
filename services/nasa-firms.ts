export interface NasaFirePoint {
  latitude: number;
  longitude: number;
  brightnessTempK: number;
  acquisitionDate: string;
  acquisitionTime: string;
  satellite: string;
  confidence: 'low' | 'nominal' | 'high';
  frpMw: number; // Fire Radiative Power (MW)
  dayNight: 'D' | 'N';
  isThermalDetection: true;
}

export interface FirmsClientResult {
  ok: boolean;
  fires: NasaFirePoint[];
  count: number;
  bboxUsed?: string;
  error?: string;
  fetchedAt: string;
  source: 'NASA FIRMS VIIRS NRT Satellite Thermal Anomaly Sensor';
}

/**
 * Safely parses NASA FIRMS CSV output
 */
export function parseFirmsCsv(csvText: string): NasaFirePoint[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf('latitude');
  const lonIdx = headers.indexOf('longitude');
  const brightIdx = headers.indexOf('bright_ti4');
  const dateIdx = headers.indexOf('acq_date');
  const timeIdx = headers.indexOf('acq_time');
  const satIdx = headers.indexOf('satellite');
  const confIdx = headers.indexOf('confidence');
  const frpIdx = headers.indexOf('frp');
  const dnIdx = headers.indexOf('daynight');

  if (latIdx === -1 || lonIdx === -1) return [];

  const fires: NasaFirePoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    if (row.length < headers.length) continue;

    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    const rawConf = confIdx !== -1 ? row[confIdx].toLowerCase().trim() : 'nominal';
    let confidence: 'low' | 'nominal' | 'high' = 'nominal';
    if (rawConf === 'l' || rawConf === 'low') {
      confidence = 'low';
    } else if (rawConf === 'h' || rawConf === 'high') {
      confidence = 'high';
    } else if (rawConf === 'n' || rawConf === 'nominal') {
      confidence = 'nominal';
    } else {
      const num = parseInt(rawConf, 10);
      if (!isNaN(num)) {
        if (num >= 80) confidence = 'high';
        else if (num >= 30) confidence = 'nominal';
        else confidence = 'low';
      }
    }

    fires.push({
      latitude: lat,
      longitude: lon,
      brightnessTempK: brightIdx !== -1 ? parseFloat(row[brightIdx]) || 300 : 300,
      acquisitionDate: dateIdx !== -1 ? row[dateIdx] : '',
      acquisitionTime: timeIdx !== -1 ? row[timeIdx] : '',
      satellite: satIdx !== -1 ? row[satIdx] : 'VIIRS',
      confidence,
      frpMw: frpIdx !== -1 ? parseFloat(row[frpIdx]) || 0 : 0,
      dayNight: dnIdx !== -1 && row[dnIdx] === 'D' ? 'D' : 'N',
      isThermalDetection: true,
    });
  }

  return fires;
}

/**
 * Fetches NASA FIRMS active fire points for a bounding box around location
 */
export async function fetchNasaFirmsFires(
  lat: number,
  lon: number,
  deltaDeg = 1.0, // approx 110km box
  customKey?: string
): Promise<FirmsClientResult> {
  const fetchedAt = new Date().toISOString();
  const source = 'NASA FIRMS VIIRS NRT Satellite Thermal Anomaly Sensor';
  const key = customKey || process.env.FIRMS_MAP_KEY;

  if (!key) {
    return {
      ok: false,
      fires: [],
      count: 0,
      error: 'FIRMS_MAP_KEY is not configured in environment variables',
      fetchedAt,
      source,
    };
  }

  const minLon = (lon - deltaDeg).toFixed(2);
  const minLat = (lat - deltaDeg).toFixed(2);
  const maxLon = (lon + deltaDeg).toFixed(2);
  const maxLat = (lat + deltaDeg).toFixed(2);
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/VIIRS_SNPP_NRT/${bbox}/2`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`NASA FIRMS API returned HTTP ${res.status}`);
    }

    const csvText = await res.text();
    // Check if FIRMS returned an error text
    if (csvText.startsWith('Error:') || csvText.includes('Invalid map_key')) {
      return {
        ok: false,
        fires: [],
        count: 0,
        error: csvText.trim(),
        fetchedAt,
        source,
      };
    }

    const fires = parseFirmsCsv(csvText);

    return {
      ok: true,
      fires,
      count: fires.length,
      bboxUsed: bbox,
      fetchedAt,
      source,
    };
  } catch (err: any) {
    return {
      ok: false,
      fires: [],
      count: 0,
      error: err.message || 'Failed to connect to NASA FIRMS',
      fetchedAt,
      source,
    };
  }
}
