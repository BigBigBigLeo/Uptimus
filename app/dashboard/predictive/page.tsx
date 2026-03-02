import prisma from '@/lib/prisma';
import PredictiveClient from './PredictiveClient';
export const dynamic = 'force-dynamic';

export default async function PredictivePage() {
    const chargers = await prisma.charger.findMany();
    const technicians = await prisma.technician.findMany({
        where: { isAvailable: true }
    });

    // Deterministic hash to prevent client-side hydration mismatches
    const hashStr = (str: string) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    };

    const componentOptions = [
        'Power Module Inverter', 'Cooling System Fan', 'Charging Cable Assembly',
        'DC Contactor Relay', 'RFID Reader Module', 'Touchscreen Display Unit',
        'Communication Gateway', 'Ground Fault Sensor', 'Voltage Regulator Board',
        'CCS2 Connector Latch', 'Thermal Management Pump', 'Circuit Breaker Panel'
    ];

    const actionOptions = [
        { label: 'Schedule Upgrade', color: '#45a29e' },
        { label: 'Replace Component', color: '#ef4444' },
        { label: 'Firmware Patch', color: '#8b5cf6' },
        { label: 'Calibrate Sensors', color: '#0ea5e9' },
        { label: 'Deep Inspection', color: '#f59e0b' },
        { label: 'Swap Module', color: '#ec4899' },
    ];

    const predictiveChargers = chargers.map((c: any) => {
        const rand = (hashStr(c.id + 'risk') % 100) / 100;
        const timeRand = (hashStr(c.id + 'time') % 100) / 100;
        const compIdx = hashStr(c.id + 'comp') % componentOptions.length;
        const actIdx = hashStr(c.id + 'act') % actionOptions.length;

        const riskScore = c.status === 'Faulted' ? Math.floor(rand * 20) + 80 :
            c.faultCount > 0 ? Math.floor(rand * 30) + 50 :
                Math.floor(rand * 20) + 5;

        return {
            id: c.id,
            stationId: c.stationId,
            city: c.city,
            country: c.country,
            brand: c.brand,
            riskScore,
            predictedComponent: riskScore > 25 ? componentOptions[compIdx] : 'None',
            preventiveAction: actionOptions[actIdx],
            daysToFailure: riskScore > 75 ? Math.floor(timeRand * 26) + 5 :
                riskScore > 50 ? Math.floor(timeRand * 20) + 10 :
                    Math.floor(timeRand * 25) + 5
        };
    }).sort((a: any, b: any) => b.riskScore - a.riskScore);

    const techList = technicians.map((t: any) => ({
        id: t.id,
        name: t.name,
        contractor: t.contractor
    }));

    return <PredictiveClient chargers={predictiveChargers} technicians={techList} />;
}
