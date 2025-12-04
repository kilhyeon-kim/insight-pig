import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { AccidentPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartSimple } from '@fortawesome/free-solid-svg-icons';

interface AccidentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: AccidentPopupData;
}

/**
 * 임신사고 팝업 (탭 구조)
 * - 탭1: 원인별 사고복수 테이블
 * - 탭2: 임신일별 사고복수 차트
 * @see popup.js tpl-accident
 */
export const AccidentPopup: React.FC<AccidentPopupProps> = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');

    // 합계 계산
    const lastWeekTotal = data.table.reduce((sum, row) => sum + row.lastWeek, 0);
    const lastMonthTotal = data.table.reduce((sum, row) => sum + row.lastMonth, 0);

    // 차트 옵션 (임신일별 사고복수)
    const chartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '임신일',
            data: data.chart.xAxis,
            axisLabel: { fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            name: '복수',
            nameTextStyle: { fontSize: 11 }
        },
        series: [{
            name: '사고복수',
            type: 'bar',
            data: data.chart.data,
            itemStyle: {
                color: '#dc3545',
                borderRadius: [4, 4, 0, 0]
            },
            label: {
                show: true,
                position: 'top',
                fontSize: 10
            }
        }]
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="임신사고"
            subtitle="지난주 원인별 및 임신일별 사고현황"
        >
            {/* 탭 헤더 */}
            <div className="popup-tabs">
                <button
                    className={`popup-tab ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                >
                    <FontAwesomeIcon icon={faTable} /> 원인별 사고복수
                </button>
                <button
                    className={`popup-tab ${activeTab === 'chart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chart')}
                >
                    <FontAwesomeIcon icon={faChartSimple} /> 임신일별 사고복수
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
                    <div className="popup-section-desc justify-end">
                        <span>단위: 복</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="popup-table-01">
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>지난주</th>
                                    <th>최근1개월</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.map((row, index) => (
                                    <tr key={index}>
                                        <td className="label">{row.type}</td>
                                        <td>{row.lastWeek}</td>
                                        <td>{row.lastMonth}</td>
                                    </tr>
                                ))}
                                <tr className="sum-row">
                                    <td className="label">합계</td>
                                    <td className="total">{lastWeekTotal}</td>
                                    <td className="total">{lastMonthTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 탭 컨텐츠: 차트 */}
            {activeTab === 'chart' && (
                <div className="popup-tab-content">
                    <div className="popup-section-desc justify-end">
                        <span>임돈전출/판매 제외</span>
                    </div>
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
