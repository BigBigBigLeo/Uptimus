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
        console.log('[Seed] Starting FULL parity remote seed...');

        // 1. Clear existing data
        await prisma.ticket.deleteMany();
        await prisma.telemetryLog.deleteMany();
        await prisma.technician.deleteMany();
        await prisma.charger.deleteMany();

        // 2. Full Technicians Data
        const technicians = [
            { name: 'Hans Müller', imageUrl: '/charger_model_ultra_fast_1772321189548.png', contractor: 'PowerGrid DE', country: 'DE', city: 'Berlin', street: 'Alexanderplatz 1', lat: 52.5200, lng: 13.4050, certs: 'DC Fast Certified, High Voltage L2', isAvailable: false, avgMttrHours: 25.1 },
            { name: 'Sarah Jenkins', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'Freelance', country: 'DE', city: 'Berlin', street: 'Friedrichstraße 2', lat: 52.5150, lng: 13.3900, certs: 'DC Fast Certified', isAvailable: false, avgMttrHours: 35.5 },
            { name: 'Klaus Wagner', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'PowerGrid DE', country: 'DE', city: 'Berlin', street: 'Kurfürstendamm 5', lat: 52.5350, lng: 13.4200, certs: 'DC Fast Certified, Alpitronic', isAvailable: true, avgMttrHours: 19.5 },
            { name: 'Dieter Schmidt', contractor: 'ElectroTech Berlin', country: 'DE', city: 'Berlin', street: 'Potsdamer Platz 1', lat: 52.4900, lng: 13.3500, certs: 'AC/DC Certified', isAvailable: false, avgMttrHours: 41.2 },
            { name: 'Lisa Weber', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'PowerGrid DE', country: 'DE', city: 'Hamburg', street: 'Reeperbahn 10', lat: 53.5511, lng: 9.9937, certs: 'ABB, DC Fast Certified', isAvailable: true, avgMttrHours: 22.1 },
            { name: 'Max Mustermann', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'Siemens Service', country: 'DE', city: 'Munich', street: 'Marienplatz 1', lat: 48.1351, lng: 11.5820, certs: 'Siemens, High Voltage L2', isAvailable: false, avgMttrHours: 18.2 },
            { name: 'Julia Klein', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'ElectroTech Berlin', country: 'DE', city: 'Frankfurt', street: 'Zeil 100', lat: 50.1109, lng: 8.6821, certs: 'Alpitronic', isAvailable: false, avgMttrHours: 29.5 },
            { name: 'Jan de Vries', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'EcoFix NL', country: 'NL', city: 'Amsterdam', street: 'Amstel 1', lat: 52.3676, lng: 4.9041, certs: 'DC Fast Certified', isAvailable: false, avgMttrHours: 21.8 },
            { name: 'Bram Bakker', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'EcoFix NL', country: 'NL', city: 'Amsterdam', street: 'Damrak 12', lat: 52.3500, lng: 4.8800, certs: 'Siemens, Alpitronic', isAvailable: true, avgMttrHours: 18.5 },
            { name: 'Lieke Visser', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'NedCharge Services', country: 'NL', city: 'Utrecht', street: 'Neude', lat: 52.0907, lng: 5.1214, certs: 'AC/DC Certified', isAvailable: false, avgMttrHours: 28.3 },
            { name: 'Tim Janssen', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'NedCharge Services', country: 'NL', city: 'Rotterdam', street: 'Coolsingel 40', lat: 51.9225, lng: 4.4791, certs: 'DC Fast Certified, High Voltage L2', isAvailable: true, avgMttrHours: 24.6 },
            { name: 'Sanne de Jong', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'EcoFix NL', country: 'NL', city: 'The Hague', street: 'Binnenhof', lat: 52.0705, lng: 4.3003, certs: 'ABB', isAvailable: false, avgMttrHours: 30.1 },
            { name: 'Thomas Smit', contractor: 'Freelance', country: 'NL', city: 'Amsterdam', street: 'Museumplein 10', lat: 52.3700, lng: 4.8900, certs: 'CCS2 Specialist', isAvailable: false, avgMttrHours: 35.0 },
            { name: 'Sophie Laurent', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'ChargeFast BE', country: 'BE', city: 'Brussels', street: 'Grand-Place 1', lat: 50.8400, lng: 4.3600, certs: 'AC/DC Certified, High Voltage L2', isAvailable: false, avgMttrHours: 32.8 },
            { name: 'Luc Peeters', imageUrl: '/technician_portrait_nl_1772321225010.png', contractor: 'ChargeFast BE', country: 'BE', city: 'Brussels', street: 'Avenue Louise 10', lat: 50.8550, lng: 4.3400, certs: 'EVBox, DC Fast Certified', isAvailable: true, avgMttrHours: 20.4 },
            { name: 'Emma Dupont', imageUrl: '/technician_portrait_de_1772321206552.png', contractor: 'VoltTech Brussels', country: 'BE', city: 'Antwerp', street: 'Meir 12', lat: 51.2194, lng: 4.4025, certs: 'DC Fast Certified', isAvailable: false, avgMttrHours: 26.1 },
            { name: 'Olivier Dubois', contractor: 'ChargeFast BE', country: 'BE', city: 'Brussels', street: 'Rue Neuve 100', lat: 50.8503, lng: 4.3517, certs: 'ABB, Siemens', isAvailable: false, avgMttrHours: 22.0 }
        ];

        // 3. Full Chargers Data
        const chargers = [
            { stationId: 'CHG-DE-4921', brand: 'Alpitronic', model: 'HYC300', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 300, connectorType: 'CCS2 x2', country: 'DE', city: 'Berlin', lat: 52.5255, lng: 13.4000, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-DE-4922', brand: 'Alpitronic', model: 'HYC300', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 300, connectorType: 'CCS2 x2', country: 'DE', city: 'Berlin', lat: 52.5300, lng: 13.3800, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-DE-1029', brand: 'ABB', model: 'Terra 54', powerKw: 50, connectorType: 'CCS2, CHAdeMO', country: 'DE', city: 'Berlin', lat: 52.5100, lng: 13.4500, status: 'Available', slaTier: 'Critical' },
            { stationId: 'CHG-DE-1030', brand: 'ABB', model: 'Terra 54', powerKw: 50, connectorType: 'CCS2', country: 'DE', city: 'Hamburg', lat: 53.5511, lng: 9.9937, status: 'Faulted', faultCount: 3, slaTier: 'Standard' },
            { stationId: 'CHG-DE-1031', brand: 'Tritium', model: 'Veefil', powerKw: 50, connectorType: 'CCS2', country: 'DE', city: 'Hamburg', lat: 53.5400, lng: 9.9800, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-DE-1032', brand: 'Siemens', model: 'Sicharge', powerKw: 160, connectorType: 'CCS2 x2', country: 'DE', city: 'Munich', lat: 48.1351, lng: 11.5820, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-DE-1033', brand: 'Siemens', model: 'Sicharge', powerKw: 160, connectorType: 'CCS2 x2', country: 'DE', city: 'Munich', lat: 48.1400, lng: 11.5900, status: 'Offline', faultCount: 1, slaTier: 'Standard' },
            { stationId: 'CHG-DE-1034', brand: 'Alpitronic', model: 'HYC150', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 150, connectorType: 'CCS2', country: 'DE', city: 'Frankfurt', lat: 50.1109, lng: 8.6821, status: 'Available', slaTier: 'Critical' },
            { stationId: 'CHG-NL-5501', brand: 'Siemens', model: 'Sicharge D', powerKw: 160, connectorType: 'CCS2 x2', country: 'NL', city: 'Amsterdam', lat: 52.3700, lng: 4.8900, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-NL-5502', brand: 'Siemens', model: 'Sicharge D', powerKw: 160, connectorType: 'CCS2 x2', country: 'NL', city: 'Amsterdam', lat: 52.3600, lng: 4.8800, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-NL-5503', brand: 'Alpitronic', model: 'HYC300', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 300, connectorType: 'CCS2 x2', country: 'NL', city: 'Utrecht', lat: 52.0907, lng: 5.1214, status: 'Available', slaTier: 'Critical' },
            { stationId: 'CHG-NL-5504', brand: 'EVBox', model: 'Trioniq', powerKw: 50, connectorType: 'CCS2', country: 'NL', city: 'Rotterdam', lat: 51.9225, lng: 4.4791, status: 'Faulted', faultCount: 2, slaTier: 'Standard' },
            { stationId: 'CHG-NL-5505', brand: 'EVBox', model: 'Trioniq', powerKw: 50, connectorType: 'CCS2', country: 'NL', city: 'Rotterdam', lat: 51.9300, lng: 4.4800, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-NL-5506', brand: 'ABB', model: 'Terra 184', powerKw: 180, connectorType: 'CCS2 x2', country: 'NL', city: 'The Hague', lat: 52.0705, lng: 4.3003, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-NL-5507', brand: 'ABB', model: 'Terra 184', powerKw: 180, connectorType: 'CCS2 x2', country: 'NL', city: 'The Hague', lat: 52.0800, lng: 4.3100, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-BE-2201', brand: 'EVBox', model: 'Trioniq', powerKw: 50, connectorType: 'CCS2, Type 2', country: 'BE', city: 'Brussels', lat: 50.8503, lng: 4.3517, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-BE-2202', brand: 'EVBox', model: 'Trioniq', powerKw: 50, connectorType: 'CCS2, Type 2', country: 'BE', city: 'Brussels', lat: 50.8400, lng: 4.3600, status: 'Available', slaTier: 'Standard' },
            { stationId: 'CHG-BE-2203', brand: 'Alpitronic', model: 'HYC150', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 150, connectorType: 'CCS2', country: 'BE', city: 'Antwerp', lat: 51.2194, lng: 4.4025, status: 'Available', slaTier: 'Premium' },
            { stationId: 'CHG-BE-2204', brand: 'Alpitronic', model: 'HYC150', modelImageUrl: '/api/brain/image/charger_model_ultra_fast_1772321189548.png', powerKw: 150, connectorType: 'CCS2', country: 'BE', city: 'Antwerp', lat: 51.2250, lng: 4.4100, status: 'Offline', faultCount: 4, slaTier: 'Critical' },
            { stationId: 'CHG-BE-2205', brand: 'Siemens', model: 'Sicharge', powerKw: 160, connectorType: 'CCS2 x2', country: 'BE', city: 'Ghent', lat: 51.0500, lng: 3.7303, status: 'Available', slaTier: 'Standard' },
        ];

        await prisma.technician.createMany({ data: technicians });
        await prisma.charger.createMany({ data: chargers });

        // 4. Create Open Tickets for Faulted/Offline ones
        const machines = await prisma.charger.findMany({ where: { status: { in: ['Faulted', 'Offline'] } } });
        for (const m of machines) {
            await prisma.ticket.create({
                data: {
                    status: 'Open',
                    faultCode: m.status === 'Faulted' ? 'ERR_POWER_MODULE_HOT' : 'ERR_OFFLINE_HEARTBEAT',
                    slaDeadline: new Date(Date.now() + 86400000),
                    chargerId: m.id
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: `FULL seed successful! Created ${technicians.length} technicians, ${chargers.length} chargers, and ${machines.length} active tickets. Full parity achieved.`
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message
        }, { status: 500 });
    }
}
