export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main className="main-content">
                {children}
            </main>
        </>
    );
}
