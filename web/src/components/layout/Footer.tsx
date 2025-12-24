'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/common';

export default function Footer() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 15; // 스크롤 임계값 (px)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // 페이지 상단 근처면 항상 표시
      if (currentScrollY < 50) {
        setIsVisible(true);
      }
      // 아래로 스크롤 (임계값 이상) → 숨김
      else if (scrollDiff > scrollThreshold) {
        setIsVisible(false);
      }
      // 위로 스크롤 (임계값 이상) → 표시
      else if (scrollDiff < -scrollThreshold) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {/* 좌측: 뒤로가기 */}
        <button
          id="btn-footer-back"
          onClick={() => router.back()}
          className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-[#2a5298] dark:hover:text-blue-400 transition-colors p-2"
        >
          <Icon name="chevron-left" className="text-xl" />
          <span className="text-xs">뒤로</span>
        </button>

        {/* 가운데: 홈 */}
        <button
          id="btn-footer-home"
          onClick={() => router.push('/')}
          className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-[#2a5298] dark:hover:text-blue-400 transition-colors p-2"
        >
          <Icon name="home" className="text-xl" />
          <span className="text-xs">홈</span>
        </button>

        {/* 우측: 설정 */}
        <button
          id="btn-footer-settings"
          onClick={() => router.push('/settings')}
          className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-[#2a5298] dark:hover:text-blue-400 transition-colors p-2"
        >
          <Icon name="cog" className="text-xl" />
          <span className="text-xs">설정</span>
        </button>
      </div>
    </footer>
  );
}
