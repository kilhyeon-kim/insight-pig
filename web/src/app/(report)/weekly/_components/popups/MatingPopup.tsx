'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { MatingPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { useChartResponsive } from './useChartResponsive';
import { useTheme } from '@/contexts/ThemeContext';

interface MatingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: MatingPopupData;
}

/**
 * 교배 실적 팝업 (탭 구조)
 * - 탭1: 유형별 교배복수 테이블
 * - 탭2: 재귀일별 교배복수 차트
 * @see popup.js tpl-mating
 */
export const MatingPopup: React.FC<MatingPopupProps> = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
    const chartSizes = useChartResponsive();
    const { theme } = useTheme();

    // 다크모드 색상
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e6edf3' : '#1d1d1f';
    const splitLineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
    const dataLabelColor = isDark ? '#ffd700' : '#333';  // 다크모드: 골드 (확 뜨는 색상)

    // 달성률 계산 (소수점 1자리)
    const calcRate = (planned: number, actual: number): string => {
        if (planned === 0) return '-';
        return ((actual / planned) * 100).toFixed(1) + '%';
    };

    // 차트 옵션 (재귀일별 교배복수)
    const chartOption = {
        tooltip: {
            trigger: 'axis' as const,
            axisPointer: { type: 'shadow' as const },
            textStyle: { fontSize: chartSizes.tooltipSize }
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '6%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category' as const,
            name: '재귀일',
            nameLocation: 'end' as const,
            nameGap: 10,
            data: data.chart.xAxis,
            axisLabel: {
                color: textColor,
                fontSize: chartSizes.axisLabelSize,
                interval: 0
            },
            nameTextStyle: {
                color: textColor,
                fontSize: chartSizes.axisNameSize,
                verticalAlign: 'top' as const,
                padding: [20, 0, 0, -40]
            }
        },
        yAxis: {
            type: 'value' as const,
            name: '복수',
            nameTextStyle: {
                color: textColor,
                fontSize: chartSizes.axisNameSize
            },
            axisLabel: {
                color: textColor,
                fontSize: chartSizes.axisLabelSize
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed' as const,
                    width: 1,
                    color: splitLineColor
                }
            }
        },
        series: [{
            name: '교배복수',
            type: 'bar' as const,
            data: data.chart.data,
            itemStyle: {
                color: '#28a745',
                borderRadius: [4, 4, 0, 0]
            },
            barWidth: '60%',
            label: {
                show: true,
                position: 'top' as const,
                fontSize: chartSizes.dataLabelSize,
                fontWeight: 600,
                color: dataLabelColor
            }
        }]
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="교배 실적"
            subtitle="지난주 유형별 교배복수 및 재귀일별 현황"
            id="pop-mating"
        >
            {/* 탭 헤더 */}
            <div className="popup-tabs">
                <button
                    className={`popup-tab ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                >
                    <FontAwesomeIcon icon={faTable} className="fa-sm" /> 유형별 교배복수
                </button>
                <button
                    className={`popup-tab ${activeTab === 'chart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chart')}
                >
                    <FontAwesomeIcon icon={faChartSimple} className="fa-sm" /> 재귀일별 교배복수
                </button>
            </div>

            {/* 탭 컨텐츠: 테이블 */}
            {activeTab === 'table' && (
                <div className="popup-tab-content" id="tab-mating-table">
                    <div className="popup-section-desc">
                        <span>달성율 : 예정작업 대비</span>
                        <span>단위: 복</span>
                    </div>
                    <div className="popup-table-wrap">
                        <table className="popup-table-02" id="tbl-mating-type">
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>예정</th>
                                    <th>교배</th>
                                    <th>달성률</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.map((row, index) => {
                                    const rate = calcRate(row.planned, row.actual);
                                    const rateValue = parseFloat(rate);
                                    return (
                                        <tr key={index}>
                                            <td className="label">{row.type}</td>
                                            <td>{row.planned}</td>
                                            <td>{row.actual}</td>
                                            <td className={rate !== '-' ? (rateValue >= 100 ? 'text-green-600' : 'text-red-600') : ''}>
                                                {rate}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="sum-row">
                                    <td className="label">합계</td>
                                    <td>{data.total.planned}</td>
                                    <td className="total">{data.total.actual}</td>
                                    {(() => {
                                        const totalRate = calcRate(data.total.planned, data.total.actual);
                                        const totalRateValue = parseFloat(totalRate);
                                        return (
                                            <td className={totalRateValue >= 100 ? 'text-green-600' : 'text-red-600'}>
                                                {totalRate}
                                            </td>
                                        );
                                    })()}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 탭 컨텐츠: 차트 */}
            {activeTab === 'chart' && (
                <div className="popup-tab-content" id="tab-mating-chart">
                    <div id="cht-mating-recur">
                        <ReactECharts
                            option={chartOption}
                            style={{ width: '100%', height: '300px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>
                </div>
            )}
        </PopupContainer>
    );
};
