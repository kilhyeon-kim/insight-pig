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
 * - 섹션2: 원인별 도폐사 테이블
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
                    <div key={index} className="stats-bar-item" style={{ borderLeftColor: item.color }}>
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
            <div className="overflow-x-auto">
                <table className="popup-table-01">
                    <thead>
                        <tr>
                            <th>원인</th>
                            <th>지난주</th>
                            <th>최근1개월</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.table.map((row, index) => (
                            <tr key={index}>
                                <td className="label">{row.reason}</td>
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
        </PopupContainer>
    );
};
