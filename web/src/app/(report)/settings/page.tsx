"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarWeek,
    faCalendarAlt,
    faCalendarCheck,
    faClock,
    faBell,
    faLock
} from '@fortawesome/free-solid-svg-icons';

// 서비스 오픈 일정
const SERVICE_SCHEDULE = {
    weekly: {
        name: '주간 보고서',
        icon: faCalendarWeek,
        isOpen: true,
        openDate: null,
        schedule: {
            dataGeneration: '매주 월요일 02:00',
            notification: '매주 월요일 07:00',
        },
        description: '지난주(월~일) 농장 운영 현황을 분석한 주간 보고서',
    },
    monthly: {
        name: '월간 보고서',
        icon: faCalendarAlt,
        isOpen: false,
        openDate: '2026-02-01',
        schedule: {
            dataGeneration: '매월 1일 03:00 (예정)',
            notification: '매월 1일 08:00 (예정)',
        },
        description: '지난달 농장 운영 현황을 종합 분석한 월간 보고서',
    },
    quarterly: {
        name: '분기 보고서',
        icon: faCalendarCheck,
        isOpen: false,
        openDate: '2026-04-01',
        schedule: {
            dataGeneration: '분기 첫째날 04:00 (예정)',
            notification: '분기 첫째날 09:00 (예정)',
        },
        description: '분기별 농장 성과를 심층 분석한 분기 보고서',
    },
};

const formatOpenDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
};

export default function SettingsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
            {/* 페이지 헤더 */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">환경설정</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    보고서별 데이터 생성 및 알림 발송 스케줄을 확인할 수 있습니다.
                </p>
            </div>

            {/* 보고서별 스케줄 카드 */}
            <div className="space-y-4">
                {Object.entries(SERVICE_SCHEDULE).map(([key, service]) => (
                    <div
                        key={key}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                            service.isOpen
                                ? 'border-gray-200 dark:border-gray-700'
                                : 'border-gray-100 dark:border-gray-800 opacity-75'
                        }`}
                    >
                        {/* 카드 헤더 */}
                        <div className={`px-5 py-4 border-b ${
                            service.isOpen
                                ? 'border-gray-100 dark:border-gray-700'
                                : 'border-gray-50 dark:border-gray-800'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        service.isOpen
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                    }`}>
                                        <FontAwesomeIcon
                                            icon={service.isOpen ? service.icon : faLock}
                                            className="text-lg"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">
                                            {service.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                                {service.isOpen ? (
                                    <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full shrink-0 text-center whitespace-nowrap">
                                        서비스 중
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-full shrink-0 text-center whitespace-nowrap">
                                        준비 중
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 카드 바디 */}
                        <div className="px-5 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 데이터 생성 시간 */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        service.isOpen
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400'
                                    }`}>
                                        <FontAwesomeIcon icon={faClock} className="text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                            데이터 생성
                                        </p>
                                        <p className={`text-sm font-medium ${
                                            service.isOpen
                                                ? 'text-gray-900 dark:text-white'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            {service.schedule.dataGeneration}
                                        </p>
                                    </div>
                                </div>

                                {/* 알림 발송 시간 */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        service.isOpen
                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400'
                                    }`}>
                                        <FontAwesomeIcon icon={faBell} className="text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                            알림톡 발송
                                        </p>
                                        <p className={`text-sm font-medium ${
                                            service.isOpen
                                                ? 'text-gray-900 dark:text-white'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            {service.schedule.notification}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 오픈 예정일 (준비 중인 서비스) */}
                            {!service.isOpen && service.openDate && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        오픈 예정일: <span className="text-blue-600 dark:text-blue-400 font-medium">{formatOpenDate(service.openDate)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 안내 문구 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">알림톡 수신 안내</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                    알림톡은 피그플랜에 등록된 휴대폰 번호로 발송됩니다.
                    수신 번호 변경은 피그플랜 관리자에게 문의해 주세요.
                </p>
            </div>
        </div>
    );
}
