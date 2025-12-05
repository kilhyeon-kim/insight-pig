import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { MatingPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { useChartResponsive } from './useChartResponsive';

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

    // 차트 옵션 (재귀일별 교배복수)
    const chartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            textStyle: { fontSize: chartSizes.tooltipSize }
        },
        grid: {
            left: '3%',
            right: '6%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '재귀일',
            nameLocation: 'end',
            nameGap: 10,
            data: data.chart.xAxis,
            axisLabel: { fontSize: chartSizes.axisLabelSize, interval: 0 },
            nameTextStyle: {
                fontSize: chartSizes.axisNameSize,
                verticalAlign: 'top',
                padding: [20, 0, 0, -10]
            }
        },
        yAxis: {
            type: 'value',
            name: '복수',
            nameTextStyle: { fontSize: chartSizes.axisNameSize },
            axisLabel: { fontSize: chartSizes.axisLabelSize }
        },
        series: [{
            name: '교배복수',
            type: 'bar',
            data: data.chart.data,
            itemStyle: {
                color: '#28a745',
                borderRadius: [4, 4, 0, 0]
            },
            label: {
                show: true,
                position: 'top',
                fontSize: chartSizes.dataLabelSize
            }
        }]
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="교배 실적"
            subtitle="지난주 유형별 교배복수 및 재귀일별 현황"
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
                <div
                    className="popup-tab-indicator"
                    style={{
                        left: activeTab === 'table' ? '0' : '50%',
                        width: '50%'
                    }}
                />
            </div>

            {/* 탭 컨텐츠: 테이블 */}
            {activeTab === 'table' && (
                <div className="popup-tab-content">
                    <div className="popup-section-desc">
                        <span>달성율 : 예정작업 대비</span>
                        <span>단위: 복</span>
                    </div>
                    <div className="popup-table-wrap">
                        <table className="popup-table-02">
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>예정</th>
                                    <th>교배</th>
                                    <th>달성률</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.map((row, index) => (
                                    <tr key={index}>
                                        <td className="label">{row.type}</td>
                                        <td>{row.planned}</td>
                                        <td>{row.actual}</td>
                                        <td className={row.rate !== '-' ? (parseInt(row.rate) >= 100 ? 'text-green-600' : 'text-red-600') : ''}>
                                            {row.rate}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="sum-row">
                                    <td className="label">합계</td>
                                    <td>{data.total.planned}</td>
                                    <td className="total">{data.total.actual}</td>
                                    <td className={parseInt(data.total.rate) >= 100 ? 'text-green-600' : 'text-red-600'}>
                                        {data.total.rate}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 탭 컨텐츠: 차트 */}
            {activeTab === 'chart' && (
                <div className="popup-tab-content">
                    <ReactECharts
                        option={chartOption}
                        style={{ width: '100%', height: '300px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </div>
            )}
        </PopupContainer>
    );
};
