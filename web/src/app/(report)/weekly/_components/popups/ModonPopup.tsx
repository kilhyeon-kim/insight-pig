'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ModonPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartSimple, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useChartResponsive } from './useChartResponsive';
import { useTheme } from '@/contexts/ThemeContext';

interface ModonPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: ModonPopupData;
}

/**
 * 모돈 현황 팝업 (탭 구조)
 * - 탭1: 모돈구성비율 테이블 (산차별 × 상태별)
 * - 탭2: 산차별 현황 차트
 * @see popup.js tpl-modon
 */
export const ModonPopup: React.FC<ModonPopupProps> = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
    const chartSizes = useChartResponsive();
    const { theme } = useTheme();

    // 다크모드 색상
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e6edf3' : '#1d1d1f';
    const splitLineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
    const dataLabelColor = isDark ? '#ffd700' : '#333';  // 다크모드: 골드 (확 뜨는 색상)

    // 행 합계 계산
    const calculateRowTotal = (row: typeof data.table[0]) =>
        row.hubo + row.imsin + row.poyu + row.eumo + row.sago;

    // 후보돈/현재모돈 분리
    const huboRows = data.table.filter(r => r.group === 'hubo');
    const currentRows = data.table.filter(r => r.group === 'current');

    // 열별 합계 계산 (현재모돈만 - 후보돈 제외)
    const columnTotals = currentRows.reduce(
        (acc, row) => ({
            hubo: acc.hubo + row.hubo,
            imsin: acc.imsin + row.imsin,
            poyu: acc.poyu + row.poyu,
            eumo: acc.eumo + row.eumo,
            sago: acc.sago + row.sago,
            change: acc.change + row.change
        }),
        { hubo: 0, imsin: 0, poyu: 0, eumo: 0, sago: 0, change: 0 }
    );

    const grandTotal = columnTotals.hubo + columnTotals.imsin + columnTotals.poyu + columnTotals.eumo + columnTotals.sago;

    // 전체 합계 (비율 계산용 - 후보돈 포함)
    const allTotal = data.table.reduce((acc, row) =>
        acc + row.hubo + row.imsin + row.poyu + row.eumo + row.sago, 0);

    // 산차별 색상 (프로토타입 PARITY_COLORS)
    const PARITY_COLORS = [
        '#ff6384', '#ff8a9b', '#36a2eb', '#4ab8f5', '#4bc0c0',
        '#9966ff', '#c274ff', '#ff9f40', '#ffce56', '#c9cbcf'
    ];

    // 차트 옵션
    const chartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            textStyle: { fontSize: chartSizes.tooltipSize }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.chart.xAxis,
            axisLabel: {
                color: textColor,
                fontSize: chartSizes.axisLabelSize,
                rotate: 45,
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            name: '두수',
            nameTextStyle: { color: textColor, fontSize: chartSizes.axisNameSize },
            axisLabel: { color: textColor, fontSize: chartSizes.axisLabelSize },
            splitLine: { lineStyle: { type: 'dashed' as const, color: splitLineColor } }
        },
        series: [{
            name: '모돈수',
            type: 'bar',
            data: data.chart.data.map((val, i) => ({
                value: val,
                itemStyle: { color: PARITY_COLORS[i % PARITY_COLORS.length] }
            })),
            barWidth: '60%',
            label: {
                show: true,
                position: 'top',
                fontSize: chartSizes.dataLabelSize,
                fontWeight: 600,
                color: dataLabelColor
            }
        }]
    };

    // 증감 표시 컴포넌트
    const ChangeIndicator = ({ value }: { value: number }) => {
        if (value === 0) return null;
        return (
            <span className={`change-badge ${value > 0 ? 'up' : 'down'}`}>
                <FontAwesomeIcon icon={value > 0 ? faCaretUp : faCaretDown} />
                {Math.abs(value)}
            </span>
        );
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="모돈 현황"
            subtitle="모돈구성비율 (11.24)"
            maxWidth="max-w-3xl"
            id="pop-modon"
        >
            {/* 탭 헤더 - 프로토타입 스타일 (밑줄 형태) */}
            <div className="popup-tabs">
                <button
                    className={`popup-tab ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                >
                    <FontAwesomeIcon icon={faTable} className="fa-sm" /> 모돈구성비율
                </button>
                <button
                    className={`popup-tab ${activeTab === 'chart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chart')}
                >
                    <FontAwesomeIcon icon={faChartSimple} className="fa-sm" /> 산차별 현황
                </button>
            </div>

            {/* 탭 컨텐츠: 테이블 */}
            {activeTab === 'table' && (
                <div className="popup-tab-content" id="tab-modon-table">
                    <div className="popup-section-desc">
                        <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCaretUp} className="text-green-500" />
                            <FontAwesomeIcon icon={faCaretDown} className="text-red-500" />
                            전주대비
                        </span>
                        <span>단위: 복</span>
                    </div>
                    <div className="popup-table-wrap" style={{ overflowX: 'auto' }}>
                        <table className="popup-table-02" id="tbl-modon-parity" style={{ minWidth: '550px' }}>
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>후보돈</th>
                                    <th>임신돈</th>
                                    <th>포유돈</th>
                                    <th>이유모돈</th>
                                    <th>사고돈</th>
                                    <th>합계</th>
                                    <th>비율</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 후보돈(미교배돈) 섹션 헤더 */}
                                <tr className="section-header">
                                    <td colSpan={8}>▸ 후보돈(미교배돈)</td>
                                </tr>
                                {/* 후보돈 행 */}
                                {huboRows.map((row, index) => {
                                    const rowTotal = calculateRowTotal(row);
                                    const rate = allTotal > 0 ? ((rowTotal / allTotal) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={`hubo-${index}`}>
                                            <td className="label">{row.parity}</td>
                                            <td>{row.hubo || '-'}</td>
                                            <td>{row.imsin || '-'}</td>
                                            <td>{row.poyu || '-'}</td>
                                            <td>{row.eumo || '-'}</td>
                                            <td>{row.sago || '-'}</td>
                                            <td className="total">
                                                {rowTotal}
                                                <ChangeIndicator value={row.change} />
                                            </td>
                                            <td>{rate}%</td>
                                        </tr>
                                    );
                                })}

                                {/* 현재모돈 (0산 이상) 섹션 헤더 */}
                                <tr className="section-header">
                                    <td colSpan={8}>▸ 현재모돈 (0산 이상)</td>
                                </tr>
                                {/* 현재모돈 행들 */}
                                {currentRows.map((row, index) => {
                                    const rowTotal = calculateRowTotal(row);
                                    const rate = allTotal > 0 ? ((rowTotal / allTotal) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={`current-${index}`}>
                                            <td className="label">{row.parity}</td>
                                            <td>{row.hubo || '-'}</td>
                                            <td>{row.imsin || '-'}</td>
                                            <td>{row.poyu || '-'}</td>
                                            <td>{row.eumo || '-'}</td>
                                            <td>{row.sago || '-'}</td>
                                            <td className="total">
                                                {rowTotal}
                                                <ChangeIndicator value={row.change} />
                                            </td>
                                            <td>{rate}%</td>
                                        </tr>
                                    );
                                })}

                                {/* 현재모돈 합계 (후보돈 제외) */}
                                <tr className="total-row">
                                    <td className="label">합계</td>
                                    <td>{columnTotals.hubo}</td>
                                    <td>{columnTotals.imsin}</td>
                                    <td>{columnTotals.poyu}</td>
                                    <td>{columnTotals.eumo}</td>
                                    <td>{columnTotals.sago}</td>
                                    <td className="total grand">
                                        {grandTotal.toLocaleString()}
                                        <ChangeIndicator value={columnTotals.change} />
                                    </td>
                                    <td>{allTotal > 0 ? ((grandTotal / allTotal) * 100).toFixed(1) : '0.0'}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 탭 컨텐츠: 차트 */}
            {activeTab === 'chart' && (
                <div className="popup-tab-content" id="tab-modon-chart">
                    <div id="cht-modon-parity">
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
