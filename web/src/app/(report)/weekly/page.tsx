"use client";

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { ReportList } from '@/components/report/ReportList';
import { useAuth, useRequireAuth } from '@/contexts/AuthContext';

// API 베이스 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReportItem {
  id: string;
  title: string;
  period: string;
  date: string;
  masterSeq?: number;
  farmNo?: number;
}

export default function WeeklyListPage() {
  // 인증 체크 - 로그인 안됐으면 리다이렉트
  const { isLoading: authLoading } = useRequireAuth('/login');
  const { user, activeFarmNo, testFarmNo, setTestFarmNo, logout } = useAuth();

  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 0, 1)); // 2024.01.01
  const [endDate, setEndDate] = useState<Date | null>(new Date()); // 오늘
  const [testFarmNoInput, setTestFarmNoInput] = useState<string>(''); // 테스트용 농장번호 입력
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 테스트 농장번호 초기화
  useEffect(() => {
    if (testFarmNo !== null) {
      setTestFarmNoInput(String(testFarmNo));
    }
  }, [testFarmNo]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const handleTestFarmNoChange = (value: string) => {
    setTestFarmNoInput(value);
    if (value === '' || value === String(user?.farmNo)) {
      // 빈값이거나 원래 farmNo와 같으면 테스트모드 해제
      setTestFarmNo(null);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setTestFarmNo(numValue);
      }
    }
  };

  const handleSearch = async () => {
    if (!activeFarmNo) {
      alert('농장번호가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setLoading(true);
    try {
      const from = formatDate(startDate);
      const to = formatDate(endDate);
      const url = `${API_BASE_URL}/api/weekly/list?farmNo=${activeFarmNo}&from=${from}&to=${to}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        const items: ReportItem[] = json.data.map((item: {
          id: string;
          masterSeq: number;
          year: number;
          weekNo: number;
          period: { from: string; to: string };
          createdAt: string;
        }) => ({
          id: `${item.masterSeq}/${activeFarmNo}`,
          masterSeq: item.masterSeq,
          farmNo: activeFarmNo,
          title: `${item.year}년 ${item.weekNo}주차 주간 보고서`,
          period: `${item.period.from} ~ ${item.period.to}`,
          date: item.createdAt,
        }));
        setReports(items);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 lg:p-4 space-y-6">
      {/* 사용자 정보 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || '-'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({user?.memberId})
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                농장: {user?.farmNm || user?.farmNo}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 조회 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 농장번호 입력 (테스트용) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">농장번호</span>
            <input
              type="text"
              value={testFarmNoInput}
              onChange={(e) => handleTestFarmNoChange(e.target.value)}
              placeholder={String(user?.farmNo || '')}
              className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
            {testFarmNo !== null && (
              <span className="text-xs text-orange-500 dark:text-orange-400">
                (테스트 모드)
              </span>
            )}
          </div>

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
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            {loading ? '조회중...' : '조회'}
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      {reports.length > 0 ? (
        <ReportList items={reports} basePath="/weekly" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
          {loading ? '조회 중...' : '조회 버튼을 클릭하여 주간 리포트를 검색하세요.'}
        </div>
      )}
    </div>
  );
}
