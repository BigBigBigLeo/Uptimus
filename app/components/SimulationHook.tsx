'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SimulationHook() {
    const pathname = usePathname();

    useEffect(() => {
        // We only want the simulation to run if we are inside the dashboard area
        // to avoid it running on a static landing page.
        if (!pathname?.startsWith('/dashboard')) return;

        console.log('Simulation engine active.');
        const interval = setInterval(() => {
            fetch('/api/simulate/tick').catch(err => console.error('Sim error:', err));
        }, 8000); // 8 seconds per tick for demo purposes

        return () => clearInterval(interval);
    }, [pathname]);

    return null; // Invisible global hook
}
