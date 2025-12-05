import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartLine, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useChartResponsive } from './useChartResponsive';

interface ShipmentMetrics {
    totalCount: number;
    compareLastWeek: string;
    grade1Rate: number;
    avgCarcass: number;
    avgBackfat: number;
    farmPrice: number;
    nationalPrice: number;
}

interface GradeChartItem {
    name: string;
    value: number;
    color: string;
    colorEnd: string;
}

interface TableRow {
    category: string;
    sub: string;
    colspan?: boolean;
    data: number[];
    sum?: number;
    avg?: number;
    unit?: string;
    highlight?: 'primary' | 'success';
    gradeRow?: boolean;
}

interface ShipmentPopupData {
    metrics: ShipmentMetrics;
    gradeChart: GradeChartItem[];
    table: {
        days: string[];
        rows: TableRow[];
    };
    analysisChart: {
        dates: string[];
        shipCount: number[];
        avgWeight: number[];
        avgBackfat: number[];
    };
    carcassChart: {
        data: number[][];
    };
}

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
 * @see popup.js tpl-shipment, com.js shipment()
 */
export const ShipmentPopup: React.FC<ShipmentPopupProps> = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'carcass'>('summary');
    const chartSizes = useChartResponsive();

    const { metrics, gradeChart, table, analysisChart, carcassChart } = data;
    const total = gradeChart.reduce((sum, d) => sum + d.value, 0);
    const priceDiff = metrics.farmPrice - metrics.nationalPrice;
    const priceColor = priceDiff >= 0 ? '#28a745' : '#dc3545';

    // 등급 분포 가로 막대 차트 옵션
    const gradeChartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            textStyle: { fontSize: chartSizes.tooltipSize },
            formatter: (params: { name: string; value: number }[]) => {
                const d = params[0];
                const name = d.name === '등외' ? '등외' : d.name + '등급';
                const pct = ((d.value / total) * 100).toFixed(1);
                return `${name}: ${d.value}두 (${pct}%)`;
            }
        },
        grid: {
            left: 30,
            right: 75,
            top: 5,
            bottom: 5
        },
        xAxis: {
            type: 'value',
            max: Math.max(...gradeChart.map(d => d.value)) * 1.5,
            show: false
        },
        yAxis: {
            type: 'category',
            data: gradeChart.map(d => d.name).reverse(),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                fontSize: chartSizes.axisLabelSize,
                fontWeight: 600
            }
        },
        series: [{
            type: 'bar',
            barWidth: 16,
            data: gradeChart.map(d => ({
                value: d.value,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: d.color },
                            { offset: 1, color: d.colorEnd }
                        ]
                    },
                    borderRadius: [0, 4, 4, 0]
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: `${d.value}두 (${((d.value / total) * 100).toFixed(1)}%)`,
                    fontSize: chartSizes.dataLabelSize,
                    color: '#666'
                }
            })).reverse()
        }]
    };

    // 출하분석 차트 옵션 (복합 차트 - 원본 com.js _initShipmentAnalysisChart 참조)
    const analysisChartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            textStyle: { color: '#333', fontSize: chartSizes.tooltipSize },
            formatter: (params: { axisValue: string; marker: string; seriesName: string; value: number }[]) => {
                let result = '<strong>' + params[0].axisValue + '</strong><br/>';
                params.forEach(item => {
                    const unit = item.seriesName === '출하두수' ? '두' : item.seriesName === '체중' ? 'kg' : 'mm';
                    result += item.marker + ' ' + item.seriesName + ': <strong>' + item.value + '</strong>' + unit + '<br/>';
                });
                return result;
            }
        },
        legend: {
            data: ['체중', '등지방 두께', '출하두수'],
            bottom: '2%',
            textStyle: { fontWeight: 600, fontSize: chartSizes.legendSize },
            itemGap: 15
        },
        grid: {
            left: '3%',
            right: '5%',
            bottom: '12%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: analysisChart.dates,
            axisLabel: { fontSize: chartSizes.axisLabelSize, interval: 0 },
            axisLine: { lineStyle: { width: 2 } }
        },
        yAxis: [
            {
                type: 'value',
                name: '출하두수',
                nameGap: 20,
                nameTextStyle: { fontSize: chartSizes.axisNameSize },
                position: 'left',
                axisLine: { show: true, lineStyle: { color: '#667eea', width: 2 } },
                axisLabel: { formatter: '{value}', fontSize: chartSizes.axisLabelSize },
                splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } }
            },
            {
                type: 'value',
                name: '체중/등지방',
                nameGap: 20,
                nameTextStyle: { fontSize: chartSizes.axisNameSize },
                position: 'right',
                min: 0,
                max: 120,
                interval: 10,
                axisLine: { show: true, lineStyle: { color: '#10b981', width: 2 } },
                axisLabel: { formatter: '{value}', fontSize: chartSizes.axisLabelSize },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '출하두수',
                type: 'bar',
                yAxisIndex: 0,
                data: analysisChart.shipCount,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#667eea' },
                            { offset: 1, color: '#764ba2' }
                        ]
                    },
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 35,
                label: {
                    show: true,
                    position: 'insideBottom',
                    offset: [0, 5],
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: chartSizes.dataLabelSize
                }
            },
            {
                name: '체중',
                type: 'line',
                yAxisIndex: 1,
                data: analysisChart.avgWeight,
                symbol: 'rect',
                symbolSize: 10,
                lineStyle: {
                    color: '#10b981',
                    width: 3,
                    shadowBlur: 8,
                    shadowColor: 'rgba(16, 185, 129, 0.4)'
                },
                itemStyle: {
                    color: '#10b981',
                    borderWidth: 3,
                    borderColor: '#fff',
                    shadowBlur: 6,
                    shadowColor: 'rgba(16, 185, 129, 0.4)'
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: chartSizes.dataLabelSize,
                    backgroundColor: '#10b981',
                    padding: [2, 4],
                    borderRadius: 3
                }
            },
            {
                name: '등지방 두께',
                type: 'line',
                yAxisIndex: 1,
                data: analysisChart.avgBackfat,
                symbol: 'triangle',
                symbolSize: 10,
                lineStyle: {
                    color: '#ffa500',
                    width: 3,
                    type: 'dashed'
                },
                itemStyle: {
                    color: '#ffa500',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#ffa500',
                    fontWeight: 'bold',
                    fontSize: chartSizes.dataLabelSize
                }
            }
        ]
    };

    // 도체분포 산점도 옵션 (원본 com.js _initShipmentCarcassChart 참조)
    // 동적 max 계산
    const carcassData = carcassChart.data || [];
    let xMax = -Infinity, yMax = -Infinity;
    carcassData.forEach(item => {
        if (item[0] > xMax) xMax = item[0];
        if (item[1] > yMax) yMax = item[1];
    });
    const xMin = 70;  // 고정
    const yMin = 10;  // 고정
    xMax = Math.max(Math.ceil(xMax / 5) * 5, 100);  // 최소 100
    yMax = Math.max(Math.ceil(yMax / 5) * 5, 30);   // 최소 30

    const carcassChartOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            textStyle: { color: '#333', fontSize: chartSizes.tooltipSize },
            formatter: (params: { data: number[] }) =>
                `도체중: ${params.data[0]}kg<br/>등지방두께: ${params.data[1]}mm<br/>두수: ${params.data[2]}두`
        },
        grid: {
            left: '0%',
            right: '2%',
            bottom: '15%',
            top: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '도체중 (kg)',
            nameLocation: 'middle',
            nameGap: 40,
            nameTextStyle: { fontSize: chartSizes.axisNameSize },
            min: xMin,
            max: xMax,
            interval: 5,
            axisLabel: { rotate: 45, fontSize: chartSizes.axisLabelSize },
            splitLine: { show: true, lineStyle: { color: '#e8e8e8', type: 'dashed' } }
        },
        yAxis: {
            type: 'value',
            name: '등지방두께 (mm)',
            nameLocation: 'end',
            nameGap: 5,
            nameTextStyle: { align: 'left', fontSize: chartSizes.axisNameSize },
            min: yMin,
            max: yMax,
            interval: 5,
            axisLabel: { fontSize: chartSizes.axisLabelSize },
            splitLine: { show: true, lineStyle: { color: '#e8e8e8', type: 'dashed' } }
        },
        series: [{
            type: 'scatter',
            symbolSize: 15,
            itemStyle: { color: 'transparent', borderWidth: 0 },
            label: {
                show: true,
                position: 'inside',
                formatter: (params: { data: number[] }) => params.data[2],
                color: '#000',
                fontWeight: 'normal',
                fontSize: chartSizes.dataLabelSize
            },
            data: carcassData,
            markArea: {
                silent: true,
                data: [
                    // 2등급 영역 (회색)
                    [
                        { xAxis: 80, yAxis: 15, itemStyle: { color: 'rgba(192, 192, 192, 0.3)' } },
                        { xAxis: 97, yAxis: 27 }
                    ],
                    // 1등급 영역 (파란색)
                    [
                        { xAxis: 83, yAxis: 17, itemStyle: { color: 'rgba(128, 128, 255, 0.3)' } },
                        { xAxis: 92, yAxis: 24 }
                    ]
                ]
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

    // 행 하이라이트 스타일
    const getRowStyle = (highlight?: 'primary' | 'success') => {
        if (highlight === 'primary') {
            return { background: 'linear-gradient(135deg, #e8f0fe 0%, #d4e4fc 100%)' };
        } else if (highlight === 'success') {
            return { background: 'linear-gradient(135deg, #e6f7ed 0%, #d4f0e0 100%)' };
        }
        return {};
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
                    <FontAwesomeIcon icon={faTable} className="fa-sm" /> 출하현황
                </button>
                <button
                    className={`popup-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    <FontAwesomeIcon icon={faChartLine} className="fa-sm" /> 출하,체중,등지방
                </button>
                <button
                    className={`popup-tab ${activeTab === 'carcass' ? 'active' : ''}`}
                    onClick={() => setActiveTab('carcass')}
                >
                    <FontAwesomeIcon icon={faCircle} className="fa-sm" /> 도체분포
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
                            <div className="metric-item highlight">
                                <div className="metric-value">{metrics.totalCount.toLocaleString()}</div>
                                <div className="metric-label">출하두수</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{metrics.grade1Rate}%</div>
                                <div className="metric-label">1등급↑</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{metrics.avgCarcass}kg</div>
                                <div className="metric-label">도체중</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value" style={{ color: priceColor }}>
                                    {metrics.farmPrice.toLocaleString()}원
                                </div>
                                <div className="metric-label">
                                    내농장가 ({priceDiff >= 0 ? '+' : ''}{priceDiff})
                                </div>
                            </div>
                        </div>
                        {/* 등급차트 - 가로 막대 */}
                        <div className="grade-chart-wrap">
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
                    <div className="popup-table-wrap" style={{ overflowX: 'auto' }}>
                        <table className="popup-table-02 shipment-table" style={{ minWidth: '600px' }}>
                            <thead>
                                <tr>
                                    <th colSpan={2} style={{ minWidth: '90px' }}>구분</th>
                                    {table.days.map((d, i) => (
                                        <th key={i}>{d.slice(-2)}일</th>
                                    ))}
                                    <th>합계</th>
                                    <th>평균</th>
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row, idx) => (
                                    <tr key={idx} style={getRowStyle(row.highlight)}>
                                        {row.colspan ? (
                                            <td colSpan={2} className="label">{row.category}</td>
                                        ) : (
                                            <>
                                                <td className="label">{row.category}</td>
                                                <td className="label sub" dangerouslySetInnerHTML={{ __html: row.sub }} />
                                            </>
                                        )}
                                        {row.data.map((v, i) => (
                                            <td key={i}>{v}</td>
                                        ))}
                                        <td className="total sum">
                                            {row.sum !== undefined ? row.sum.toLocaleString() : ''}
                                        </td>
                                        <td className="total avg">
                                            {!row.gradeRow && row.avg !== undefined ? row.avg + (row.unit || '') : ''}
                                        </td>
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
