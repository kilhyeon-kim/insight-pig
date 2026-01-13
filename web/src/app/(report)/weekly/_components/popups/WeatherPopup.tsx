'use client';

import React, { useState, useEffect } from 'react';
import { WeatherPopupData, WeatherHourlyItem } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSun,
    faCloud,
    faCloudRain,
    faSnowflake,
    faCloudSun,
    faSmog,
    faDroplet,
    faTemperatureHigh,
    faTemperatureLow,
    faUmbrella,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WeatherPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: WeatherPopupData;
    farmNo?: number;
}

// 날씨 코드별 아이콘 매핑
const getWeatherIcon = (weatherCd: string) => {
    switch (weatherCd) {
        case 'sunny': return faSun;
        case 'cloudy': return faCloudSun;
        case 'overcast': return faCloud;
        case 'rainy': return faCloudRain;
        case 'snowy': return faSnowflake;
        case 'shower': return faCloudRain;
        default: return faCloud;
    }
};

// 날씨 코드별 색상
const getWeatherColor = (weatherCd: string) => {
    switch (weatherCd) {
        case 'sunny': return 'text-orange-400';
        case 'cloudy': return 'text-gray-400';
        case 'overcast': return 'text-gray-500';
        case 'rainy': return 'text-blue-400';
        case 'snowy': return 'text-sky-300';
        case 'shower': return 'text-blue-500';
        default: return 'text-gray-400';
    }
};

// 날씨 코드별 배경 그라데이션
const getWeatherBg = (weatherCd: string, isSelected: boolean) => {
    if (isSelected) {
        switch (weatherCd) {
            case 'sunny': return 'bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20';
            case 'cloudy': return 'bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-800/30 dark:to-blue-900/20';
            case 'overcast': return 'bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800/40 dark:to-gray-900/30';
            case 'rainy': return 'bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
            case 'snowy': return 'bg-gradient-to-b from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20';
            default: return 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900/20';
        }
    }
    return 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50';
};

export const WeatherPopup: React.FC<WeatherPopupProps> = ({ isOpen, onClose, data, farmNo }) => {
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [hourlyData, setHourlyData] = useState<WeatherHourlyItem[]>([]);
    const [loadingHourly, setLoadingHourly] = useState(false);

    // daily 데이터 생성 (기존 데이터에서 변환)
    const dailyItems = React.useMemo(() => {
        if (!data?.xData) return [];

        const today = new Date();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        return data.xData.map((label, idx) => {
            // xData: "01/13(월)" 형식에서 파싱
            const match = label.match(/(\d{2})\/(\d{2})\((.)\)/);
            const month = match ? match[1] : '';
            const day = match ? match[2] : '';
            const dayOfWeek = match ? match[3] : '';

            // wkDate 계산 (현재 연도 기준)
            const wkDate = `${today.getFullYear()}${month}${day}`;

            // 오늘/내일/모레 라벨
            let periodLabel = '';
            const itemDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
            const diffDays = Math.floor((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) periodLabel = '오늘';
            else if (diffDays === 1) periodLabel = '내일';
            else if (diffDays === 2) periodLabel = '모레';

            return {
                wkDate,
                dayLabel: `${day}일(${dayOfWeek})`,
                periodLabel,
                weatherCd: data.weatherCode?.[idx] || 'cloudy',
                weatherNm: getWeatherName(data.weatherCode?.[idx] || 'cloudy'),
                tempHigh: data.maxTemp?.[idx] ?? null,
                tempLow: data.minTemp?.[idx] ?? null,
                rainProb: data.rainProb?.[idx] ?? 0,
                humidity: data.humidity?.[idx] ?? null,
            };
        });
    }, [data]);

    // 날씨 코드 → 이름
    function getWeatherName(code: string): string {
        const map: Record<string, string> = {
            sunny: '맑음',
            cloudy: '구름많음',
            overcast: '흐림',
            rainy: '비',
            snowy: '눈',
            shower: '소나기',
        };
        return map[code] || code;
    }

    // 시간별 데이터 조회
    useEffect(() => {
        if (!isOpen || !farmNo || dailyItems.length === 0) return;

        const fetchHourly = async () => {
            setLoadingHourly(true);
            try {
                const wkDate = dailyItems[selectedIdx]?.wkDate;
                if (!wkDate) return;

                const res = await fetch(`${API_BASE_URL}/api/weekly/weather/hourly/${farmNo}/${wkDate}`);
                const json = await res.json();

                if (json.success && json.data?.hourly) {
                    setHourlyData(json.data.hourly.map((h: any) => ({
                        wkTime: h.wkTime,
                        timeLabel: `${h.wkTime.substring(0, 2)}시`,
                        weatherCd: h.weatherCd || 'cloudy',
                        weatherNm: h.weatherNm || '',
                        temp: h.temp,
                        rainProb: h.rainProb ?? 0,
                        humidity: h.humidity,
                    })));
                } else {
                    setHourlyData([]);
                }
            } catch (e) {
                console.error('시간별 날씨 조회 실패:', e);
                setHourlyData([]);
            } finally {
                setLoadingHourly(false);
            }
        };

        fetchHourly();
    }, [isOpen, farmNo, selectedIdx, dailyItems]);

    // 선택된 날짜 변경
    const handlePrev = () => {
        if (selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
    };

    const handleNext = () => {
        if (selectedIdx < dailyItems.length - 1) setSelectedIdx(selectedIdx + 1);
    };

    const selectedDay = dailyItems[selectedIdx];

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="주간 날씨 예보"
            subtitle="기상청 단기예보 기준"
            maxWidth="max-w-3xl"
            id="pop-weather"
        >
            {/* 일별 카드 그리드 */}
            <div className="mb-4">
                <div className="grid grid-cols-7 gap-1">
                    {dailyItems.map((item, idx) => (
                        <div
                            key={item.wkDate}
                            onClick={() => setSelectedIdx(idx)}
                            className={`
                                cursor-pointer rounded-lg p-2 text-center transition-all border
                                ${idx === selectedIdx
                                    ? `${getWeatherBg(item.weatherCd, true)} border-blue-400 dark:border-blue-500 shadow-sm`
                                    : `${getWeatherBg(item.weatherCd, false)} border-gray-200 dark:border-gray-700`
                                }
                            `}
                        >
                            {/* 날짜 라벨 */}
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                {item.periodLabel && (
                                    <span className="text-blue-500 dark:text-blue-400 block">{item.periodLabel}</span>
                                )}
                                {item.dayLabel}
                            </div>

                            {/* 날씨 아이콘 */}
                            <div className={`text-2xl my-2 ${getWeatherColor(item.weatherCd)}`}>
                                <FontAwesomeIcon icon={getWeatherIcon(item.weatherCd)} />
                            </div>

                            {/* 기온 */}
                            <div className="text-xs space-y-0.5">
                                <div className="text-red-500 font-semibold">
                                    {item.tempHigh !== null ? `${item.tempHigh}°` : '-'}
                                </div>
                                <div className="text-blue-500 font-semibold">
                                    {item.tempLow !== null ? `${item.tempLow}°` : '-'}
                                </div>
                            </div>

                            {/* 강수확률 */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <FontAwesomeIcon icon={faUmbrella} className="mr-0.5 text-blue-400" />
                                {item.rainProb}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 선택된 날짜 상세 정보 */}
            {selectedDay && (
                <div className={`rounded-lg p-4 mb-4 ${getWeatherBg(selectedDay.weatherCd, true)} border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={handlePrev}
                            disabled={selectedIdx === 0}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>

                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {selectedDay.periodLabel && <span className="text-blue-500 mr-2">{selectedDay.periodLabel}</span>}
                                {selectedDay.dayLabel}
                            </div>
                            <div className={`text-3xl my-2 ${getWeatherColor(selectedDay.weatherCd)}`}>
                                <FontAwesomeIcon icon={getWeatherIcon(selectedDay.weatherCd)} />
                                <span className="ml-2 text-lg text-gray-700 dark:text-gray-200">{selectedDay.weatherNm}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={selectedIdx === dailyItems.length - 1}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    {/* 상세 정보 그리드 */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                            <FontAwesomeIcon icon={faTemperatureHigh} className="text-red-400 mb-1" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">최고</div>
                            <div className="text-lg font-bold text-red-500">
                                {selectedDay.tempHigh !== null ? `${selectedDay.tempHigh}°C` : '-'}
                            </div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                            <FontAwesomeIcon icon={faTemperatureLow} className="text-blue-400 mb-1" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">최저</div>
                            <div className="text-lg font-bold text-blue-500">
                                {selectedDay.tempLow !== null ? `${selectedDay.tempLow}°C` : '-'}
                            </div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                            <FontAwesomeIcon icon={faUmbrella} className="text-indigo-400 mb-1" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">강수확률</div>
                            <div className="text-lg font-bold text-indigo-500">{selectedDay.rainProb}%</div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                            <FontAwesomeIcon icon={faDroplet} className="text-cyan-400 mb-1" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">습도</div>
                            <div className="text-lg font-bold text-cyan-500">
                                {selectedDay.humidity !== null ? `${selectedDay.humidity}%` : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 시간별 예보 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    시간별 예보 - {selectedDay?.dayLabel}
                </h4>

                {loadingHourly ? (
                    <div className="flex items-center justify-center h-24 text-gray-400">
                        <span className="animate-pulse">로딩 중...</span>
                    </div>
                ) : hourlyData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                            {hourlyData.map((hour, idx) => (
                                <div
                                    key={hour.wkTime}
                                    className="shrink-0 w-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2"
                                >
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {hour.timeLabel}
                                    </div>
                                    <div className={`text-lg mb-1 ${getWeatherColor(hour.weatherCd)}`}>
                                        <FontAwesomeIcon icon={getWeatherIcon(hour.weatherCd)} />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {hour.temp !== null ? `${hour.temp}°` : '-'}
                                    </div>
                                    <div className="text-xs text-blue-400">
                                        {hour.rainProb}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                        시간별 데이터가 없습니다
                    </div>
                )}
            </div>
        </PopupContainer>
    );
};
