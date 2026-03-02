import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Topnav from './components/layout/Topnav';
import SimulationHook from './components/SimulationHook';
import "./globals.css";

export const metadata = {
  title: 'Uptimus - Repair Orchestration',
  description: 'AI-driven repair orchestration for European EV networks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Topnav />
        <SimulationHook />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  );
}
