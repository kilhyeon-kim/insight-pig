'use client';

import Link from 'next/link';
import { Icon } from '@/components/common';
import { MainLayout } from '@/components/layout';

const menuItems = [
  {
    name: '주간 리포트',
    href: '/weekly',
    icon: 'clipboard-list',
    description: '주간 실적 분석',
    color: 'bg-blue-500',
  },
  {
    name: '월간 리포트',
    href: '/monthly',
    icon: 'calendar-alt',
    description: '월간 종합 리포트',
    color: 'bg-green-500',
  },
  {
    name: '컨설팅 진단서',
    href: '/consulting',
    icon: 'stethoscope',
    description: '농장 진단 리포트',
    color: 'bg-purple-500',
  },
];

export default function HomePage() {
  return (
    <MainLayout showFooter={false}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] p-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <span className="text-3xl mr-2">🐷</span>
            인사이트 피그플랜
          </h1>
          <p className="text-gray-500">서비스를 선택하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[var(--primary)] transition-all group"
            >
              <div className={item.color + ' w-20 h-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'}>
                <Icon name={item.icon} className="text-white text-3xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h2>
              <p className="text-sm text-gray-500">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
