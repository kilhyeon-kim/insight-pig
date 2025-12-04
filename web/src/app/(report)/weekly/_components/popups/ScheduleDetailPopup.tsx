import React from 'react';
import { ScheduleDetailItem } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface ScheduleDetailPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: ScheduleDetailItem[];
    title: string;
    subtitle?: string;
}

export const ScheduleDetailPopup: React.FC<ScheduleDetailPopupProps> = ({
    isOpen,
    onClose,
    data,
    title,
    subtitle
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
        >
            <div className="space-y-4">
                {/* 단위 표시 */}
                <div className="flex justify-end text-xs text-gray-500 dark:text-gray-400">
                    단위: 복
                </div>

                {/* 테이블 */}
                <div className="wr-table-card-wrap">
                    <table className="wr-table card-style">
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
                                            <td>{item.taskNm}</td>
                                            <td>{item.baseTask}</td>
                                            <td>{item.targetGroup}</td>
                                            <td>{item.elapsedDays}</td>
                                            <td className="font-semibold">{item.count}</td>
                                        </tr>
                                    ))}
                                    {/* 합계 행 */}
                                    <tr className="total-row">
                                        <td colSpan={4}>합계</td>
                                        <td style={{ color: 'var(--rp-accent-primary)' }}>{totalCount}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8" style={{ color: 'var(--rp-text-tertiary)' }}>
                                        예정된 작업이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PopupContainer>
    );
};
