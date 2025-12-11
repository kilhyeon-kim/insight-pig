"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 테스트 계정 목록
const TEST_ACCOUNTS = [
  { label: '-- 테스트 계정 선택 --', id: '', pw: '' },
  { label: 'jjin', id: 'jjin', pw: '1122' },
  { label: '(주)에이스팜', id: '(주)에이스팜', pw: '0' },
  { label: '부강농장1', id: '부강농장1', pw: '0' },
  { label: '여리', id: '여리', pw: '0' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');

  // 이미 로그인된 경우 리다이렉트 (주석 처리 - 수동 로그아웃 후 재로그인 허용)
  // useEffect(() => {
  //   if (!isLoading && isAuthenticated) {
  //     router.push('/weekly');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(username, password);

    if (result.success) {
      router.push('/weekly');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }

    setIsSubmitting(false);
  };

  // 테스트 계정 선택 시 자동 로그인
  const handleTestAccountSelect = async (value: string) => {
    setSelectedAccount(value);
    if (!value) return;

    const account = TEST_ACCOUNTS.find(acc => acc.id === value);
    if (!account || !account.id) return;

    setError('');
    setIsSubmitting(true);

    const result = await login(account.id, account.pw);

    if (result.success) {
      router.push('/weekly');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
      setSelectedAccount('');
    }

    setIsSubmitting(false);
  };

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          {/* 돼지 로고 */}
          <div className="flex justify-center mb-4">
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              {/* 돼지 얼굴 */}
              <circle cx="50" cy="50" r="35" fill="#22c55e" />
              {/* 귀 */}
              <ellipse cx="25" cy="25" rx="12" ry="15" fill="#22c55e" />
              <ellipse cx="75" cy="25" rx="12" ry="15" fill="#22c55e" />
              <ellipse cx="25" cy="25" rx="8" ry="10" fill="#16a34a" />
              <ellipse cx="75" cy="25" rx="8" ry="10" fill="#16a34a" />
              {/* 코 */}
              <ellipse cx="50" cy="58" rx="18" ry="14" fill="#16a34a" />
              <circle cx="43" cy="58" r="4" fill="#1f2937" />
              <circle cx="57" cy="58" r="4" fill="#1f2937" />
              {/* 눈 */}
              <circle cx="35" cy="42" r="6" fill="#1f2937" />
              <circle cx="65" cy="42" r="6" fill="#1f2937" />
              <circle cx="37" cy="40" r="2" fill="white" />
              <circle cx="67" cy="40" r="2" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">인사이트피그플랜</h1>
          <p className="text-gray-400 mt-2">스마트 양돈 관리 시스템</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* 테스트 계정 콤보박스 */}
          <div>
            <label htmlFor="testAccount" className="block text-sm font-medium text-yellow-400 mb-2">
              테스트 계정 (선택 시 자동 로그인)
            </label>
            <select
              id="testAccount"
              value={selectedAccount}
              onChange={(e) => handleTestAccountSelect(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-700 border border-yellow-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
            >
              {TEST_ACCOUNTS.map((account) => (
                <option key={account.id || 'default'} value={account.id}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">또는 직접 입력</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              아이디
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg text-gray-900 font-semibold bg-green-500 hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">© 2024 PigPlan. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
