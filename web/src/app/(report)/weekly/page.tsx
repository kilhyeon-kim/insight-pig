"use client";

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ReportList } from '@/components/report/ReportList';

export default function WeeklyListPage() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(2023, 8, 1)); // 2023.09.01
  const [endDate, setEndDate] = useState<Date | null>(new Date(2023, 9, 31)); // 2023.10.31

  const reports = [
    { id: '40', title: '10월 1주차 주간 보고서', period: '2023.10.01 ~ 2023.10.07', date: '2023.10.08' },
    { id: '39', title: '9월 4주차 주간 보고서', period: '2023.09.24 ~ 2023.09.30', date: '2023.10.01' },
    { id: '38', title: '9월 3주차 주간 보고서', period: '2023.09.17 ~ 2023.09.23', date: '2023.09.24' },
    { id: '37', title: '9월 2주차 주간 보고서', period: '2023.09.10 ~ 2023.09.16', date: '2023.09.17' },
    { id: '36', title: '9월 1주차 주간 보고서', period: '2023.09.03 ~ 2023.09.09', date: '2023.09.10' },
  ];

  const handleSearch = () => {
    // TODO: API 호출하여 날짜 범위로 필터링
    console.log('Search:', startDate, endDate);
  };

  return (
    <div className="p-2 sm:p-3 lg:p-4 space-y-6">
      {/* 조회 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">조회기간</span>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="w-28 bg-transparent text-sm text-center focus:outline-none text-gray-900 dark:text-white"
              dateFormat="yyyy.MM.dd"
            />
            <span className="text-gray-400">~</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              className="w-28 bg-transparent text-sm text-center focus:outline-none text-gray-900 dark:text-white"
              dateFormat="yyyy.MM.dd"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            조회
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <ReportList items={reports} basePath="/weekly" />
    </div>
  );
}
