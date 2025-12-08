import React from 'react';
import { ScheduleDetailItem } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface ScheduleDetailPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: ScheduleDetailItem[];
    title: string;
    subtitle?: string;
    id?: string;
}

export const ScheduleDetailPopup: React.FC<ScheduleDetailPopupProps> = ({
    isOpen,
    onClose,
    data,
    title,
    subtitle,
    id
}) => {
    // 합계 계산
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            maxWidth="max-w-xl"
            id={id}
        >
            <>
                {/* 단위 표시 */}
                <div className="popup-section-desc justify-end">
                    <span>단위: 복</span>
                </div>

                {/* 테이블 */}
                <div className="popup-table-wrap">
                    <table className="popup-table-02" id={id ? `tbl-${id.replace('pop-', '')}` : undefined}>
                        <thead>
                            <tr>
                                <th>작업명</th>
                                <th>기준작업</th>
                                <th>대상돈군</th>
                                <th>경과일</th>
                                <th>대상복수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                <>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="label">{item.taskNm}</td>
                                            <td>{item.baseTask}</td>
                                            <td>{item.targetGroup}</td>
                                            <td>{item.elapsedDays}</td>
                                            <td className="total">{item.count}</td>
                                        </tr>
                                    ))}
                                    {/* 합계 행 */}
                                    <tr className="sum-row">
                                        <td className="label" colSpan={4}>합계</td>
                                        <td className="total">{totalCount}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8" style={{ color: 'var(--rp-text-tertiary)' }}>
                                        예정된 작업이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        </PopupContainer>
    );
};
