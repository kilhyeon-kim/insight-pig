import React from 'react';
import '@/css/style.css';

export default function WeeklyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="weekly-report-container">
            {children}
        </div>
    );
}
