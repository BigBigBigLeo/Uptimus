'use client';

import dynamic from 'next/dynamic';

// Next.js requires ssr: false for react-leaflet components since they rely on the window object.
// Calling dynamic() with ssr: false is only allowed inside Client Components.
const NetworkMap = dynamic(() => import('./Map'), { ssr: false });

export default function MapWrapper(props: any) {
    return <NetworkMap {...props} />;
}
