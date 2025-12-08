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
    const lastWeekTotal = data.table.reduce((sum, row) => sum + row.lastWeek, 0);
    const lastMonthTotal = data.table.reduce((sum, row) => sum + row.lastMonth, 0);

    // 스탯바 데이터 (원본: danger/warning 클래스)
    const statItems = [
        { label: '도태', value: data.stats.dotae, type: 'danger' as const },
        { label: '폐사', value: data.stats.dead, type: 'danger' as const },
        { label: '전출', value: data.stats.transfer, type: 'warning' as const },
        { label: '판매', value: data.stats.sale, type: 'warning' as const }
    ];

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="도태폐사"
            subtitle="지난주 유형별 및 원인별 도폐사현황"
            id="pop-culling"
        >
            {/* 유형별 스탯 바 */}
            <div className="popup-section-label">
                <span>유형별 현황</span>
                <span className="popup-section-desc">단위: 복</span>
            </div>
            <div className="stats-bar-modern" id="cullingStatsBar">
                {statItems.map((item, index) => (
                    <div key={index} className="stats-bar-modern-item">
                        <div className="stats-bar-modern-label">{item.label}</div>
                        <div className={`stats-bar-modern-value ${item.type}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* 원인별 도폐사 테이블 */}
            <div className="popup-section-label" style={{ marginTop: '16px' }}>
                <span>원인별 도폐사</span>
                <span className="popup-section-desc">단위: 복</span>
            </div>
            <div className="popup-table-wrap">
                <table className="popup-table-02" id="tbl-culling-cause">
                    <thead>
                        <tr>
                            <th>원인</th>
                            <th>지난주</th>
                            <th>최근1개월</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.table.map((row, index) => {
                            // 비율: 합계 기준 (100% = 합계)
                            const lastWeekPercent = lastWeekTotal > 0 ? (row.lastWeek / lastWeekTotal * 100).toFixed(1) : '0';
                            const lastMonthPercent = lastMonthTotal > 0 ? (row.lastMonth / lastMonthTotal * 100).toFixed(1) : '0';
                            // 바 너비: 합계 대비 비율
                            const lastWeekBarWidth = lastWeekTotal > 0 ? (row.lastWeek / lastWeekTotal * 100) : 0;
                            const lastMonthBarWidth = lastMonthTotal > 0 ? (row.lastMonth / lastMonthTotal * 100) : 0;

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
                                                    className="bar-fill gray"
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
