"use client";

import React from 'react';
import { ReportList } from '@/components/report/ReportList';

export default function MonthlyListPage() {
  const reports = [
    { id: '10', title: '10월 월간 보고서', period: '2023.10.01 ~ 2023.10.31', status: 'draft' as const, date: '2023.11.01' },
    { id: '9', title: '9월 월간 보고서', period: '2023.09.01 ~ 2023.09.30', status: 'completed' as const, date: '2023.10.01' },
  ];

  return (
    <div className="p-2 sm:p-3 lg:p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">월간 보고서 목록</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          새 보고서 작성
        </button>
      </div>

      <ReportList items={reports} basePath="/monthly" />
    </div>
  );
}
