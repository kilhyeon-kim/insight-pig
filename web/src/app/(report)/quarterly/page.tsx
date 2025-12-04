"use client";

import React from 'react';
import { ReportList } from '@/components/report/ReportList';

export default function QuarterlyListPage() {
    const reports = [
        { id: '3', title: '3분기 컨설팅 보고서', period: '2023.07.01 ~ 2023.09.30', status: 'completed' as const, date: '2023.10.15' },
        { id: '2', title: '2분기 컨설팅 보고서', period: '2023.04.01 ~ 2023.06.30', status: 'completed' as const, date: '2023.07.15' },
    ];

    return (
        <div className="p-2 sm:p-3 lg:p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">분기 보고서 목록</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    새 보고서 작성
                </button>
            </div>

            <ReportList items={reports} basePath="/quarterly" />
        </div>
    );
}
