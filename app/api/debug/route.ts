import { NextResponse } from 'next/server';
import prisma, { checkConnection } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const shouldSeed = searchParams.get('seed') === 'true';

    if (shouldSeed) {
        return handleRemoteSeed();
    }

    const status = await checkConnection();

    // Check if tables exist
    let tableCheck = { exists: false, count: 0, error: null as string | null };
    if (status.success) {
        try {
            tableCheck.count = await prisma.charger.count();
            tableCheck.exists = true;
        } catch (e: any) {
            tableCheck.exists = false;
            tableCheck.error = e.message;
        }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        env: {
            VERCEL: process.env.VERCEL || 'false',
            NODE_ENV: process.env.NODE_ENV,
            HAS_DATABASE_URL: !!process.env.DATABASE_URL,
            DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) + '...' : 'none'
        },
        database: {
            ...status,
            tables: tableCheck
        },
        actions: {
            seed_url: '/api/debug?seed=true'
        }
    });
}

async function handleRemoteSeed() {
    try {
        console.log('[Seed] Starting comprehensive remote seed...');

        // 1. Clear existing test data only if it's the single test charger
        const count = await prisma.charger.count();
        if (count > 0) {
            const testCharger = await prisma.charger.findFirst({ where: { stationId: 'CHG-VERCEL-01' } });
            if (testCharger && count === 1) {
                await prisma.charger.deleteMany();
                await prisma.technician.deleteMany();
                await prisma.ticket.deleteMany();
            } else if (count > 5) {
                return NextResponse.json({ message: "Database already contains multiple records. Skipping to avoid duplicates." });
            }
        }

        // 2. Create Technicians
        const tech = await prisma.technician.create({
            data: {
                name: 'Alex Rivera',
                contractor: 'Vercel Field Ops',
                country: 'DE',
                city: 'Berlin',
                lat: 52.5200,
                lng: 13.4050,
                certs: 'DC Fast, HV Level 3',
                isAvailable: true,
                avgMttrHours: 18.5
            }
        });

        // 3. Create Chargers (Mix of healthy and faulted)
        await prisma.charger.createMany({
            data: [
                {
                    stationId: 'CHG-BER-01',
                    brand: 'Alpitronic',
                    model: 'HYC300',
                    powerKw: 300,
                    connectorType: 'CCS2',
                    country: 'DE',
                    city: 'Berlin',
                    lat: 52.5255,
                    lng: 13.4000,
                    status: 'Available',
                    slaTier: 'Premium'
                },
                {
                    stationId: 'CHG-BER-02',
                    brand: 'ABB',
                    model: 'Terra 184',
                    powerKw: 180,
                    connectorType: 'CCS2',
                    country: 'DE',
                    city: 'Berlin',
                    lat: 52.5100,
                    lng: 13.3900,
                    status: 'Faulted',
                    faultCount: 3,
                    slaTier: 'Critical'
                },
                {
                    stationId: 'CHG-BER-03',
                    brand: 'Siemens',
                    model: 'Sicharge',
                    powerKw: 160,
                    connectorType: 'CCS2',
                    country: 'DE',
                    city: 'Berlin',
                    lat: 52.5350,
                    lng: 13.4200,
                    status: 'Offline',
                    faultCount: 5,
                    slaTier: 'Standard'
                }
            ]
        });

        // 4. Create a Ticket for one of the faulted chargers
        const faultedCharger = await prisma.charger.findFirst({ where: { status: 'Faulted' } });
        if (faultedCharger) {
            await prisma.ticket.create({
                data: {
                    status: 'Open',
                    faultCode: 'ERR_COOLING_SYSTEM',
                    slaDeadline: new Date(Date.now() + 86400000), // 24 hours from now
                    chargerId: faultedCharger.id
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Comprehensive seed successful! Created technicians, healthy chargers, and faulted assets. The dashboard manifests and maps should now be fully populated."
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            hint: "If you see 'Table does not exist', you must run 'npx prisma db push' locally first."
        }, { status: 500 });
    }
}
