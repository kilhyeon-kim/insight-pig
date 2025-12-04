import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ShipmentPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartLine, faCircle } from '@fortawesome/free-solid-svg-icons';

interface ShipmentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: ShipmentPopupData;
}

/**
 * 출하 실적 팝업 (3탭 구조)
 * - 탭1: 출하현황 (메트릭스 + 등급차트 + 일별 테이블)
 * - 탭2: 출하분석 차트 (출하,체중,등지방)
 * - 탭3: 도체분포 차트 (산점도)
 * @see popup.js tpl-shipment
 */
export const ShipmentPopup: React.FC<ShipmentPopupProps> = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'carcass'>('summary');

    // 등급 분포 파이 차트 옵션
    const gradeChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}두 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { fontSize: 11 }
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: {
                label: { show: true, fontSize: 12, fontWeight: 'bold' }
            },
            data: data.gradeDistribution.map(item => ({
                name: item.grade,
                value: item.count,
                itemStyle: {
                    color: item.grade === '1+' ? '#667eea' :
                           item.grade === '1' ? '#28a745' :
                           item.grade === '2' ? '#ffc107' : '#dc3545'
                }
            }))
        }]
    };

    // 출하분석 차트 옵션 (복합 차트)
    const analysisChartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        legend: {
            data: ['출하두수', '평균체중', '평균등지방'],
            bottom: 0,
            textStyle: { fontSize: 11 }
        },
        grid: {
            left: '3%',
            right: '10%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.analysisChart.dates,
            axisLabel: { fontSize: 11 }
        },
        yAxis: [
            {
                type: 'value',
                name: '두수',
                position: 'left',
                nameTextStyle: { fontSize: 11 }
            },
            {
                type: 'value',
                name: 'kg/mm',
                position: 'right',
                nameTextStyle: { fontSize: 11 }
            }
        ],
        series: [
            {
                name: '출하두수',
                type: 'bar',
                data: data.analysisChart.shipCount,
                itemStyle: { color: '#667eea', borderRadius: [4, 4, 0, 0] }
            },
            {
                name: '평균체중',
                type: 'line',
                yAxisIndex: 1,
                data: data.analysisChart.avgWeight,
                itemStyle: { color: '#28a745' },
                lineStyle: { width: 2 }
            },
            {
                name: '평균등지방',
                type: 'line',
                yAxisIndex: 1,
                data: data.analysisChart.avgBackfat,
                itemStyle: { color: '#ffc107' },
                lineStyle: { width: 2 }
            }
        ]
    };

    // 도체분포 산점도 옵션
    const carcassChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: (params: { data: number[] }) => `도체중: ${params.data[0]}kg<br/>등지방: ${params.data[1]}mm`
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '도체중(kg)',
            nameTextStyle: { fontSize: 11 },
            splitLine: { lineStyle: { type: 'dashed' } }
        },
        yAxis: {
            type: 'value',
            name: '등지방(mm)',
            nameTextStyle: { fontSize: 11 },
            splitLine: { lineStyle: { type: 'dashed' } }
        },
        series: [{
            type: 'scatter',
            symbolSize: 10,
            data: data.carcassChart.data.map(item => [item.weight, item.backfat]),
            itemStyle: {
                color: '#667eea',
                opacity: 0.7
            }
        }]
    };

    const getTabIndicatorStyle = () => {
        switch (activeTab) {
            case 'summary': return { left: '0%', width: '33.33%' };
            case 'analysis': return { left: '33.33%', width: '33.33%' };
            case 'carcass': return { left: '66.66%', width: '33.33%' };
        }
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="출하 실적"
            subtitle="지난주 출하현황 및 도체분석"
            maxWidth="max-w-3xl"
        >
            {/* 탭 헤더 (3탭) */}
            <div className="popup-tabs">
                <button
                    className={`popup-tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    <FontAwesomeIcon icon={faTable} /> 출하현황
                </button>
                <button
                    className={`popup-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    <FontAwesomeIcon icon={faChartLine} /> 출하,체중,등지방
                </button>
                <button
                    className={`popup-tab ${activeTab === 'carcass' ? 'active' : ''}`}
                    onClick={() => setActiveTab('carcass')}
                >
                    <FontAwesomeIcon icon={faCircle} /> 도체분포
                </button>
                <div className="popup-tab-indicator" style={getTabIndicatorStyle()} />
            </div>

            {/* 탭1: 출하현황 */}
            {activeTab === 'summary' && (
                <div className="popup-tab-content">
                    {/* 메트릭스 + 등급차트 그리드 */}
                    <div className="shipment-top-grid">
                        {/* 메트릭스 2x2 */}
                        <div className="metrics-2x2">
                            <div className="metric-item">
                                <div className="metric-value">{data.metrics.totalCount}<span className="unit">두</span></div>
                                <div className="metric-label">출하두수</div>
                                <div className="metric-compare positive">{data.metrics.compareLastWeek}</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{data.metrics.grade1Rate}<span className="unit">%</span></div>
                                <div className="metric-label">1등급↑</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{data.metrics.avgCarcass}<span className="unit">kg</span></div>
                                <div className="metric-label">평균도체중</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{data.metrics.avgBackfat}<span className="unit">mm</span></div>
                                <div className="metric-label">평균등지방</div>
                            </div>
                        </div>
                        {/* 등급차트 */}
                        <div className="grade-chart-wrap">
                            <div className="grade-chart-title">등급비율</div>
                            <ReactECharts
                                option={gradeChartOption}
                                style={{ width: '100%', height: '120px' }}
                                opts={{ renderer: 'svg' }}
                            />
                        </div>
                    </div>

                    {/* 일별 출하현황 테이블 */}
                    <div className="popup-section-label" style={{ marginTop: '12px' }}>
                        <span>일별 출하현황</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="popup-table-01" style={{ fontSize: '12px', minWidth: '500px' }}>
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>출하두수</th>
                                    <th>평균체중</th>
                                    <th>평균등지방</th>
                                    <th>1등급↑</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.dailyTable.map((row, index) => (
                                    <tr key={index}>
                                        <td className="label">{row.date}</td>
                                        <td>{row.count}</td>
                                        <td>{row.avgWeight}kg</td>
                                        <td>{row.avgBackfat}mm</td>
                                        <td>{row.grade1Rate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 탭2: 출하분석 차트 */}
            {activeTab === 'analysis' && (
                <div className="popup-tab-content">
                    <ReactECharts
                        option={analysisChartOption}
                        style={{ width: '100%', height: '320px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </div>
            )}

            {/* 탭3: 도체분포 차트 */}
            {activeTab === 'carcass' && (
                <div className="popup-tab-content">
                    <ReactECharts
                        option={carcassChartOption}
                        style={{ width: '100%', height: '350px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </div>
            )}
        </PopupContainer>
    );
};
