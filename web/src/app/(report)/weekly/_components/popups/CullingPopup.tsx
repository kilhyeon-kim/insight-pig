import React from 'react';
import { CullingPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface CullingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: CullingPopupData;
}

/**
 * 도태폐사 팝업 (탭 없음)
 * - 섹션1: 유형별 스탯 바
 * - 섹션2: 원인별 도폐사 테이블 (비율 막대 포함)
 * @see popup.js tpl-culling
 */
export const CullingPopup: React.FC<CullingPopupProps> = ({ isOpen, onClose, data }) => {
    // 합계 계산
    const statsTotal = data.stats.dotae + data.stats.dead + data.stats.transfer + data.stats.sale;
    const lastWeekTotal = data.table.reduce((sum, row) => sum + row.lastWeek, 0);
    const lastMonthTotal = data.table.reduce((sum, row) => sum + row.lastMonth, 0);

    // 스탯바 데이터
    const statItems = [
        { label: '도태', value: data.stats.dotae, color: '#667eea' },
        { label: '폐사', value: data.stats.dead, color: '#dc3545' },
        { label: '전출', value: data.stats.transfer, color: '#28a745' },
        { label: '판매', value: data.stats.sale, color: '#ffc107' }
    ];

    // 비율 계산용 최대값
    const maxLastWeek = Math.max(...data.table.map(row => row.lastWeek), 1);
    const maxLastMonth = Math.max(...data.table.map(row => row.lastMonth), 1);

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="도태폐사"
            subtitle="지난주 유형별 및 원인별 도폐사현황"
        >
            {/* 유형별 스탯 바 */}
            <div className="popup-section-label">
                <span>유형별 현황</span>
                <span className="popup-section-desc">단위: 복</span>
            </div>
            <div className="stats-bar">
                {statItems.map((item, index) => (
                    <div key={index} className="stats-bar-item shadow-sm" style={{ borderLeftColor: item.color }}>
                        <div className="stats-bar-value" style={{ color: item.color }}>
                            {item.value}
                        </div>
                        <div className="stats-bar-label">{item.label}</div>
                    </div>
                ))}
                <div className="stats-bar-item total">
                    <div className="stats-bar-value">{statsTotal}</div>
                    <div className="stats-bar-label">합계</div>
                </div>
            </div>

            {/* 원인별 도폐사 테이블 */}
            <div className="popup-section-label" style={{ marginTop: '16px' }}>
                <span>원인별 도폐사</span>
                <span className="popup-section-desc">단위: 복</span>
            </div>
            <div className="popup-table-wrap">
                <table className="popup-table-02">
                    <thead>
                        <tr>
                            <th>원인</th>
                            <th>지난주</th>
                            <th>최근1개월</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.table.map((row, index) => {
                            const lastWeekPercent = lastWeekTotal > 0 ? (row.lastWeek / lastWeekTotal * 100).toFixed(1) : '0';
                            const lastMonthPercent = lastMonthTotal > 0 ? (row.lastMonth / lastMonthTotal * 100).toFixed(1) : '0';
                            const lastWeekBarWidth = (row.lastWeek / maxLastWeek * 100);
                            const lastMonthBarWidth = (row.lastMonth / maxLastMonth * 100);

                            return (
                                <tr key={index}>
                                    <td className="label">{row.reason}</td>
                                    <td>
                                        <div className="cell-with-bar">
                                            <div className="bar-bg">
                                                <div
                                                    className="bar-fill red"
                                                    style={{ width: `${lastWeekBarWidth}%` }}
                                                />
                                            </div>
                                            <span className="percent">{lastWeekPercent}%</span>
                                            <span className="value">{row.lastWeek}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-with-bar">
                                            <div className="bar-bg">
                                                <div
                                                    className="bar-fill blue"
                                                    style={{ width: `${lastMonthBarWidth}%` }}
                                                />
                                            </div>
                                            <span className="percent">{lastMonthPercent}%</span>
                                            <span className="value">{row.lastMonth}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="sum-row">
                            <td className="label">합계</td>
                            <td className="total">{lastWeekTotal}</td>
                            <td className="total">{lastMonthTotal}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PopupContainer>
    );
};
