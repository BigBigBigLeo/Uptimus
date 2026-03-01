/**
 * Utility functions for simulated routing and ETA calculations.
 * In a production app, this would integrate with OpenRouteService.
 */

// Haversine formula to calculate distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Calculate ETA based on straight-line distance and average speed
export function calculateETA(distanceKm: number, averageSpeedKmh: number = 60): {
    minutes: number,
    formatted: string
} {
    // Add an urban penalty factor (straight line is usually ~1.4x shorter than road)
    const roadDistance = distanceKm * 1.4;

    const hours = roadDistance / averageSpeedKmh;
    const minutes = Math.round(hours * 60);

    // Format as "2h 15m" or just "45m"
    if (minutes < 60) {
        return { minutes, formatted: `${minutes}m` };
    }

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { minutes, formatted: `${h}h ${m}m` };
}

// Predict route waypoints for the UI simulation
export function simulateRouteWaypoints(lat1: number, lon1: number, lat2: number, lon2: number, numWaypoints: number = 10) {
    const waypoints = [];
    for (let i = 0; i <= numWaypoints; i++) {
        const fraction = i / numWaypoints;
        const lat = lat1 + (lat2 - lat1) * fraction;
        const lng = lon1 + (lon2 - lon1) * fraction;
        waypoints.push({ lat, lng });
    }
    return waypoints;
}
