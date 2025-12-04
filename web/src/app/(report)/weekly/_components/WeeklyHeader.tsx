"use client";

import React from 'react';
import Image from 'next/image';
import { WeeklyHeader as WeeklyHeaderType } from '@/types/weekly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface WeeklyHeaderProps {
    data: WeeklyHeaderType;
}

export const WeeklyHeader: React.FC<WeeklyHeaderProps> = ({ data }) => {
    // 기간 문자열에서 연도, 월, 주차 추출 (예: "2023.09.25 ~ 2023.10.01")
    const periodParts = data.period.split(' ~ ');
    const startDate = periodParts[0] || '';
    const endDate = periodParts[1] || '';

    // 연도와 월 추출
    const [year, month] = startDate.split('.').slice(0, 2);

    return (
        <div className="report-header">
            <div className="report-header-top">
                <h1>
                    <Image
                        src="/images/logo.png"
                        alt="피그플랜"
                        width={120}
                        height={32}
                        className="brightness-0 invert"
                    />
                    <span className="ml-2">주간 리포트</span>
                </h1>
                <ThemeToggle variant="button" />
            </div>
            <div className="report-header-info">
                <div className="report-farm-info">{data.farmName}</div>
                <div className="report-period">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{year}년 {month}월 {data.weekNum}주차 ({startDate} ~ {endDate})</span>
                </div>
            </div>
        </div>
    );
};
