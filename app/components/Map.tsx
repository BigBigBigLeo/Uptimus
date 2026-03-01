'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in Next.js
const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const iconUrl = '/leaflet/marker-icon.png';
const shadowUrl = '/leaflet/marker-shadow.png';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Available': return '#10b981';
        case 'Faulted': return '#ef4444';
        case 'Offline': return '#f59e0b';
        default: return '#3b82f6';
    }
};

const createCustomIcon = (status: string, isTech: boolean = false) => {
    if (isTech) {
        // Truck for 'En Route', Wrench for everything else
        const isEnRoute = status === 'En Route' || status === 'Busy' || status === 'On Site';
        const strokeColor = status === 'Available' ? '#10b981' : '#3b82f6';

        // Use Truck for movement, Wrench for static/work
        const iconSvg = status === 'En Route'
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${strokeColor}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v5a1 1 0 0 0 1 1h2"></path><path d="M15 8h3.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707V12h-7V8z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${strokeColor}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                ${iconSvg}
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    }

    const bgColor = getStatusColor(status);
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${bgColor}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

type Charger = {
    id: string;
    stationId: string;
    brand: string;
    status: string;
    lat: number;
    lng: number;
    city: string;
};

type Technician = {
    id: string;
    name: string;
    contractor: string;
    isAvailable: boolean;
    lat: number;
    lng: number;
};

function BoundsFitter({ chargers, technicians }: { chargers?: Charger[], technicians?: Technician[] }) {
    const map = useMap();

    // Stringify dependencies to avoid infinite re-renders from new array references passed by parent
    const chargersStr = JSON.stringify(chargers);
    const techniciansStr = JSON.stringify(technicians);

    useEffect(() => {
        if (!chargers || !technicians) return;

        // Zoom and bound specifically if there is 1 charger AND 1+ techs (Dispatch/Tracking view)
        if (chargers.length === 1 && technicians.length > 0) {
            const bounds = L.latLngBounds([]);
            chargers.forEach(c => bounds.extend([c.lat, c.lng]));
            technicians.forEach(t => bounds.extend([t.lat, t.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            }
        }
    }, [chargersStr, techniciansStr, map]);
    return null;
}

export default function NetworkMap({ chargers = [], technicians = [], zoom: zoomProp }: { chargers?: Charger[], technicians?: Technician[], zoom?: number }) {
    // If single technician with no chargers, center on them; otherwise center on Europe
    const center: [number, number] = (technicians.length === 1 && chargers.length === 0)
        ? [technicians[0].lat, technicians[0].lng]
        : (chargers.length === 1) ? [chargers[0].lat, chargers[0].lng] : [51.5, 9.0];
    const zoom = zoomProp ?? ((technicians.length === 1 && chargers.length === 0) ? 13 : 5);

    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', backgroundColor: '#0b0c10' }}>
                <BoundsFitter chargers={chargers} technicians={technicians} />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {chargers.map(charger => (
                    <Marker
                        key={`chg-${charger.id}`}
                        position={[charger.lat, charger.lng]}
                        icon={createCustomIcon(charger.status, false)}
                    >
                        <Popup>
                            <div style={{ color: '#000', padding: '4px' }}>
                                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{charger.stationId}</strong>
                                <div style={{ fontSize: '12px' }}>{charger.city}</div>
                                <div style={{ fontSize: '12px', color: getStatusColor(charger.status), fontWeight: 'bold' }}>{charger.status}</div>
                                <a href={`/dashboard/chargers/${charger.id}`} style={{ display: 'block', marginTop: '8px', color: '#3b82f6' }}>View Details</a>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {technicians.map(tech => (
                    <Marker
                        key={`tech-${tech.id}`}
                        position={[tech.lat, tech.lng]}
                        icon={createCustomIcon(tech.isAvailable ? 'Available' : 'Busy', true)}
                    >
                        <Popup>
                            <div style={{ color: '#000', padding: '4px' }}>
                                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{tech.name}</strong>
                                <div style={{ fontSize: '12px' }}>{tech.contractor}</div>
                                <div style={{ fontSize: '12px', color: tech.isAvailable ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{tech.isAvailable ? 'Available' : 'Busy'}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>
        </div>
    );
}
