"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faCalendarAlt, faChartBar, faCog, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: 'Weekly 보고서', path: '/weekly', icon: faCalendarAlt },
        { name: 'Monthly 보고서', path: '/monthly', icon: faChartPie },
        { name: '분기 보고서', path: '/quarterly', icon: faChartBar },
        { name: '환경설정', path: '/settings', icon: faCog },
    ];

    const handleLogout = () => {
        // TODO: Clear auth tokens
        router.push('/login');
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">INSPIG</h2>
                    <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                onClick={() => {
                                    // Close sidebar on mobile when navigating
                                    if (window.innerWidth < 1024) onClose();
                                }}
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">테마</span>
                        <ThemeToggle variant="button" className="sidebar-theme-btn" />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
                        로그아웃
                    </button>
                </div>
            </div>
        </>
    );
};
