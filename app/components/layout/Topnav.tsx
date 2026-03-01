"use client";

import Link from 'next/link';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Topnav.module.css';

export default function Topnav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoSection}>
                <Link href="/dashboard" className={styles.logoLink} onClick={closeMobileMenu}>
                    <img src="/logo.png" alt="UPTIMUS" className={styles.logoImage} />
                </Link>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <Search size={16} className={styles.searchIcon} />
                    <input type="text" placeholder="Search tickets, IDs, or assets..." className={styles.searchInput} />
                    <div className={styles.shortcut}>⌘K</div>
                </div>
            </div>

            <nav className={styles.navLinks}>
                <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
                <Link href="/dashboard/chargers" className={styles.navLink}>Network</Link>
                <Link href="/dashboard/dispatch" className={styles.navLink}>Dispatch</Link>
                <Link href="/dashboard/technicians" className={styles.navLink}>Technicians</Link>
                <Link href="/dashboard/predictive" className={styles.navLink}>Predictive AI</Link>
                <Link href="/dashboard/analytics" className={styles.navLink}>Analytics</Link>
            </nav>

            <div className={styles.userSection}>
                <div className={styles.notification}>
                    <Bell size={20} />
                    <div className={styles.redDot}></div>
                </div>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>AM</div>
                </div>
                <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                <Link href="/dashboard" className={styles.navLink} onClick={closeMobileMenu}>Dashboard</Link>
                <Link href="/dashboard/chargers" className={styles.navLink} onClick={closeMobileMenu}>Network</Link>
                <Link href="/dashboard/dispatch" className={styles.navLink} onClick={closeMobileMenu}>Dispatch</Link>
                <Link href="/dashboard/technicians" className={styles.navLink} onClick={closeMobileMenu}>Technicians</Link>
                <Link href="/dashboard/predictive" className={styles.navLink} onClick={closeMobileMenu}>Predictive AI</Link>
                <Link href="/dashboard/analytics" className={styles.navLink} onClick={closeMobileMenu}>Analytics</Link>
            </div>
        </header>
    );
}
