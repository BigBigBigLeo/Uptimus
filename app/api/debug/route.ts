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
        console.log('[Seed] Starting remote seed trigger...');

        // Basic check: only seed if empty to prevent accidental duplicates
        const count = await prisma.charger.count();
        if (count > 0) {
            return NextResponse.json({ message: "Database already contains data. Skipping seed to prevent duplicates." });
        }

        // We'll perform a minimal seed here for a quick fix
        await prisma.charger.create({
            data: {
                stationId: 'CHG-VERCEL-01',
                brand: 'Alpitronic',
                model: 'Hypercharger',
                powerKw: 300,
                connectorType: 'CCS2',
                country: 'DE',
                city: 'Vercel Cloud',
                lat: 52.52,
                lng: 13.405,
                status: 'Available',
                slaTier: 'Premium'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Remote seed successful! Created 1 test charger. The dashboard should now load without crashing."
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            hint: "If you see 'Table does not exist', you must run 'npx prisma db push' locally first."
        }, { status: 500 });
    }
}
