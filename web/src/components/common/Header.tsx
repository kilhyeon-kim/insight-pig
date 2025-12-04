'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/common';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-2 py-2">
        {/* 왼쪽: 햄버거 메뉴 + 로고 */}
        <div className="flex items-center gap-1">
          {/* 햄버거 메뉴 버튼 */}
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="메뉴 열기"
          >
            <Icon name="bars" className="text-lg" />
          </button>

          {/* 로고 */}
          <Link href="/weekly" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="피그플랜"
              width={100}
              height={28}
              className="dark:brightness-0 dark:invert"
            />
          </Link>
        </div>

        {/* 오른쪽: 농장 정보 + 사용자 */}
        <div className="flex items-center gap-3">
          {/* 농장 정보 */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
            <Icon name="home" className="text-sm text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium">행복농장</span>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2a5298] text-white rounded-full flex items-center justify-center">
              <Icon name="user" className="text-sm" />
            </div>
            <button className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
