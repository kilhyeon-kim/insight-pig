'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WeatherPopupData, WeatherHourlyItem } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSun,
    faCloud,
    faCloudRain,
    faSnowflake,
    faCloudSun,
    faTemperatureHigh,
    faTemperatureLow,
    faUmbrella,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import * as echarts from 'echarts';
import { getKSTDate } from '@/utils/date';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WeatherPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: WeatherPopupData;
    farmNo?: number;
    region?: string;  // 읍면동 지역명
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

export const WeatherPopup: React.FC<WeatherPopupProps> = ({ isOpen, onClose, data, farmNo, region }) => {
    const [selectedIdx, setSelectedIdx] = useState<number>(-1); // -1: 초기화 전
    const [hourlyData, setHourlyData] = useState<WeatherHourlyItem[]>([]);
    const [loadingHourly, setLoadingHourly] = useState(false);
    const [currentHourInfo, setCurrentHourInfo] = useState<{ data: WeatherHourlyItem; todayData: any } | null>(null); // 현재 시간 정보 (고정)
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // daily 데이터 생성 (기존 데이터에서 변환)
    const dailyItems = React.useMemo(() => {
        if (!data?.xData) return [];

        // 한국 시간(KST) 기준으로 오늘 날짜 계산
        const kstTime = getKSTDate();
        const todayDate = new Date(kstTime.getFullYear(), kstTime.getMonth(), kstTime.getDate());

        return data.xData.map((label, idx) => {
            // xData: "01/13(월)" 형식에서 파싱
            const match = label.match(/(\d{2})\/(\d{2})\((.)\)/);
            const month = match ? match[1] : '';
            const day = match ? match[2] : '';
            const dayOfWeek = match ? match[3] : '';

            // wkDate 계산 (한국 시간 기준 연도)
            const wkDate = `${kstTime.getFullYear()}${month}${day}`;

            // 오늘/내일/모레 라벨 (날짜만 비교)
            let periodLabel = '';
            const itemDate = new Date(kstTime.getFullYear(), parseInt(month) - 1, parseInt(day));
            const diffDays = Math.round((itemDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) periodLabel = '오늘';
            else if (diffDays === 1) periodLabel = '내일';
            else if (diffDays === 2) periodLabel = '모레';

            // 단기예보는 오늘~+2일(3일간)만 시간별 데이터 있음
            // +3일 이후는 중기예보로 일별 데이터만 존재
            const hasHourlyData = diffDays >= 0 && diffDays <= 2;

            return {
                wkDate,
                dayLabel: `${day}일(${dayOfWeek})`,
                periodLabel,
                diffDays,
                hasHourlyData,
                weatherCd: data.weatherCode?.[idx] || 'cloudy',
                weatherNm: getWeatherName(data.weatherCode?.[idx] || 'cloudy'),
                tempHigh: data.maxTemp?.[idx] ?? null,
                tempLow: data.minTemp?.[idx] ?? null,
                rainProb: data.rainProb?.[idx] ?? 0,
                humidity: data.humidity?.[idx] ?? null,
            };
        });
    }, [data]);

    // 팝업 열릴 때 오늘 날짜를 기본 선택으로 설정 + 현재 시간 정보 조회
    useEffect(() => {
        if (isOpen && dailyItems.length > 0) {
            const todayIdx = dailyItems.findIndex(item => item.periodLabel === '오늘');
            setSelectedIdx(todayIdx >= 0 ? todayIdx : 0);

            // 현재 시간 정보 조회 (오늘 날짜 기준)
            const fetchCurrentHour = async () => {
                if (!farmNo) return;
                const todayData = dailyItems.find(item => item.periodLabel === '오늘');
                if (!todayData) return;

                try {
                    const res = await fetch(`${API_BASE_URL}/api/weekly/weather/hourly/${farmNo}/${todayData.wkDate}`);
                    const json = await res.json();

                    if (json.success && json.data?.hourly) {
                        const hourlyList = json.data.hourly.map((h: any) => ({
                            wkTime: h.wkTime,
                            timeLabel: `${h.wkTime.substring(0, 2)}시`,
                            weatherCd: h.weatherCd || 'cloudy',
                            weatherNm: h.weatherNm || '',
                            temp: h.temp,
                            rainProb: h.rainProb ?? 0,
                            humidity: h.humidity,
                        }));

                        // 현재 시간에 가장 가까운 데이터 찾기 (KST 기준)
                        const kstNow = getKSTDate();
                        const currentHour = kstNow.getHours();
                        const currentHHMM = `${String(currentHour).padStart(2, '0')}00`;

                        let closest = hourlyList[0];
                        let minDiff = Math.abs(parseInt(hourlyList[0].wkTime) - parseInt(currentHHMM));

                        for (const h of hourlyList) {
                            const diff = Math.abs(parseInt(h.wkTime) - parseInt(currentHHMM));
                            if (diff < minDiff) {
                                minDiff = diff;
                                closest = h;
                            }
                        }

                        setCurrentHourInfo({ data: closest, todayData });
                    }
                } catch (e) {
                    console.error('현재 시간 날씨 조회 실패:', e);
                }
            };

            fetchCurrentHour();
        } else if (!isOpen) {
            // 팝업 닫힐 때 초기화
            setSelectedIdx(-1);
            setHourlyData([]);
            setCurrentHourInfo(null);
        }
    }, [isOpen, dailyItems, farmNo]);

    // 선택된 일자의 시간별 데이터 조회 (차트용)
    useEffect(() => {
        if (!isOpen || !farmNo || dailyItems.length === 0 || selectedIdx < 0) return;

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

    // 시간별 차트 렌더링
    useEffect(() => {
        if (!chartRef.current || hourlyData.length === 0) return;

        // Dispose existing chart
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const isDark = document.documentElement.classList.contains('dark');

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ddd',
                textStyle: { color: isDark ? '#e6edf3' : '#333', fontSize: 12 },
                formatter: (params: any) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    const idx = params[0].dataIndex;
                    const hour = hourlyData[idx];
                    let result = `<strong>${hour.timeLabel}</strong><br/>`;
                    result += `날씨: ${hour.weatherNm}<br/>`;
                    params.forEach((p: any) => {
                        if (p.seriesName === '기온') {
                            result += `${p.seriesName}: ${p.value}°C<br/>`;
                        } else if (p.seriesName === '강수확률') {
                            result += `${p.seriesName}: ${p.value}%<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['기온', '강수확률'],
                bottom: 0,
                textStyle: { fontSize: 11, color: isDark ? '#e6edf3' : '#555' }
            },
            grid: {
                left: '3%',
                right: '4%',
                top: '15%',
                bottom: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: hourlyData.map(h => h.timeLabel),
                boundaryGap: false,
                axisLabel: { fontSize: 10, color: isDark ? '#aaa' : '#666' },
                axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.2)' : '#ddd' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '기온(°C)',
                    nameTextStyle: { fontSize: 10, color: isDark ? '#aaa' : '#666' },
                    axisLabel: { fontSize: 10, color: isDark ? '#aaa' : '#666', formatter: '{value}°' },
                    axisLine: { show: false },
                    splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' } }
                },
                {
                    type: 'value',
                    name: '강수(%)',
                    nameTextStyle: { fontSize: 10, color: isDark ? '#aaa' : '#666' },
                    min: 0,
                    max: 100,
                    axisLabel: { fontSize: 10, color: isDark ? '#aaa' : '#666', formatter: '{value}%' },
                    axisLine: { show: false },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '기온',
                    type: 'line',
                    data: hourlyData.map(h => h.temp),
                    smooth: true,
                    lineStyle: { width: 2, color: '#ff6b6b' },
                    itemStyle: { color: '#ff6b6b' },
                    symbolSize: 6,
                    label: {
                        show: true,
                        position: 'top',
                        fontSize: 10,
                        color: '#ff6b6b',
                        formatter: '{c}°'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                            { offset: 1, color: 'rgba(255, 107, 107, 0.05)' }
                        ])
                    }
                },
                {
                    name: '강수확률',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: hourlyData.map(h => h.rainProb),
                    barWidth: '40%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(74, 144, 226, 0.8)' },
                            { offset: 1, color: 'rgba(74, 144, 226, 0.3)' }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    }
                }
            ]
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
            chartInstance.current = null;
        };
    }, [hourlyData]);

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
            {/* 섹션 1: 현재 시간 날씨 (오늘 기준, 고정) */}
            {currentHourInfo && (
                <div id="weather-current-hour" className={`rounded-lg p-4 mb-4 ${getWeatherBg(currentHourInfo.data.weatherCd, true)} border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        {/* 왼쪽: 현재 시간 날씨 */}
                        <div className="flex items-center gap-4">
                            <div className={`text-4xl ${getWeatherColor(currentHourInfo.data.weatherCd)}`}>
                                <FontAwesomeIcon icon={getWeatherIcon(currentHourInfo.data.weatherCd)} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                    <span>오늘 {currentHourInfo.data.timeLabel}</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {currentHourInfo.data.temp !== null ? `${currentHourInfo.data.temp}°C` : '-'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {region || currentHourInfo.data.weatherNm}
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 오늘 상세 정보 */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faTemperatureHigh} className="text-red-400" />
                                    <span>최고</span>
                                </div>
                                <div className="text-lg font-bold text-red-500">
                                    {currentHourInfo.todayData.tempHigh !== null ? `${currentHourInfo.todayData.tempHigh}°` : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faTemperatureLow} className="text-blue-400" />
                                    <span>최저</span>
                                </div>
                                <div className="text-lg font-bold text-blue-500">
                                    {currentHourInfo.todayData.tempLow !== null ? `${currentHourInfo.todayData.tempLow}°` : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faUmbrella} className="text-indigo-400" />
                                    <span>강수</span>
                                </div>
                                <div className="text-lg font-bold text-indigo-500">
                                    {currentHourInfo.data.rainProb}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 섹션 2: 일별 카드 그리드 */}
            <div id="weather-daily-cards" className="mb-4">
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
                                ${!item.hasHourlyData ? 'opacity-70' : ''}
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

                            {/* 기온 (최고/최저) */}
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

            {/* 섹션 3: 시간별 예보 차트 */}
            <div id="weather-hourly-chart" className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    시간별 예보 - {selectedDay?.dayLabel}
                </h4>

                {loadingHourly ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <span className="animate-pulse">로딩 중...</span>
                    </div>
                ) : hourlyData.length > 0 ? (
                    <>
                        <div ref={chartRef} style={{ width: '100%', height: '250px' }} />
                        {/* 시간대별 날씨 아이콘 */}
                        <div className="flex justify-between px-6 mt-1">
                            {hourlyData.map((hour) => (
                                <div key={hour.wkTime} className="flex flex-col items-center" style={{ width: `${100 / hourlyData.length}%` }}>
                                    <FontAwesomeIcon
                                        icon={getWeatherIcon(hour.weatherCd)}
                                        className={`text-sm ${getWeatherColor(hour.weatherCd)}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        시간별 데이터가 없습니다
                    </div>
                )}
            </div>
        </PopupContainer>
    );
};
