import { NextRequest, NextResponse } from 'next/server';
import {
  DronePacketSchema,
  storeDroneTelemetry,
  getDroneTelemetryStatus,
} from '@/services/drone';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('demo') === 'true';

  const status = getDroneTelemetryStatus(isDemo);
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = DronePacketSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Invalid Drone Packet Schema',
        details: result.error.format(),
        ruleNotice: 'MQ135 must be relative ADC count (0-1023). PMS5003 required.',
      },
      { status: 400 }
    );
  }

  const packet = result.data;
  storeDroneTelemetry(packet);

  return NextResponse.json({
    ok: true,
    message: 'Telemetry packet ingested successfully',
    droneId: packet.droneId,
    altitudeM: packet.altitudeM,
    badge: packet.isSimulated ? 'SIMULATED' : 'Live Connection',
    ingestedAt: new Date().toISOString(),
  });
}
