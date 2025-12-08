'use client';

import React, { useEffect, useRef } from 'react';
import { WeatherPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import * as echarts from 'echarts';

interface WeatherPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: WeatherPopupData;
}

export const WeatherPopup: React.FC<WeatherPopupProps> = ({ isOpen, onClose, data }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!isOpen || !chartRef.current) return;

        // Dispose existing chart
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        // Initialize chart
        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const isDark = document.documentElement.classList.contains('dark');

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { color: isDark ? '#e6edf3' : '#555' } },
                backgroundColor: isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ddd',
                textStyle: { color: isDark ? '#e6edf3' : '#333' },
                formatter: (params: unknown) => {
                    const p = params as { dataIndex: number; seriesName: string; value: number }[];
                    if (!Array.isArray(p) || p.length === 0) return '';
                    const idx = p[0].dataIndex;
                    const weatherCodes = data?.weatherCode || [];
                    const rainProbs = data?.rainProb || [];
                    const weatherMap: Record<string, string> = {
                        sunny: '맑음 ☀️',
                        cloudy: '흐림 ☁️',
                        rainy: '비 🌧️',
                        snowy: '눈 ❄️'
                    };
                    let result = `<strong>${data?.xData?.[idx] || ''}</strong><br/>`;
                    result += `날씨: ${weatherMap[weatherCodes[idx]] || weatherCodes[idx]}<br/>`;
                    result += `강수확률: ${rainProbs[idx]}%<br/>`;
                    p.forEach(item => {
                        result += `${item.seriesName}: ${item.value}°C<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['최고기온', '최저기온'],
                bottom: '2%',
                textStyle: {
                    fontSize: 12,
                    color: isDark ? '#e6edf3' : '#555'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                top: '10%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data?.xData || [],
                boundaryGap: false,
                axisLabel: {
                    fontSize: 11,
                    color: isDark ? '#e6edf3' : '#555',
                    rotate: 0
                },
                axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.2)' : '#ddd' } }
            },
            yAxis: {
                type: 'value',
                min: -5,
                max: 25,
                axisLabel: {
                    fontSize: 11,
                    color: isDark ? '#e6edf3' : '#555',
                    formatter: '{value}°C'
                },
                axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.2)' : '#ddd' } },
                splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' } }
            },
            series: [
                {
                    name: '최고기온',
                    type: 'line',
                    data: data?.maxTemp || [],
                    smooth: false,
                    lineStyle: {
                        width: 3,
                        color: '#ff6b6b'
                    },
                    itemStyle: {
                        color: '#ff6b6b'
                    },
                    symbolSize: 10,
                    label: {
                        show: true,
                        position: 'top',
                        fontWeight: 'bold',
                        color: '#ff6b6b',
                        formatter: '{c}°'
                    }
                },
                {
                    name: '최저기온',
                    type: 'line',
                    data: data?.minTemp || [],
                    smooth: false,
                    lineStyle: {
                        width: 3,
                        color: '#4a90e2'
                    },
                    itemStyle: {
                        color: '#4a90e2'
                    },
                    symbolSize: 10,
                    label: {
                        show: true,
                        position: 'bottom',
                        fontWeight: 'bold',
                        color: '#4a90e2',
                        formatter: '{c}°'
                    }
                }
            ]
        };

        chart.setOption(option);

        // Resize handler
        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
            chartInstance.current = null;
        };
    }, [isOpen, data]);

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="주간 날씨 예보"
            subtitle="기상청 단기예보 기준"
            maxWidth="max-w-2xl"
            id="pop-weather"
        >
            <div id="cht-weather-temp" ref={chartRef} style={{ width: '100%', height: '320px' }} />
        </PopupContainer>
    );
};
