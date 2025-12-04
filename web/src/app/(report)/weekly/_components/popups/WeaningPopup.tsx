import React from 'react';
import { WeaningPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface WeaningPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: WeaningPopupData;
}

/**
 * 이유 실적 팝업 (탭 없음)
 * - 섹션1: 작업예정대비 테이블
 * - 섹션2: 이유 성적 테이블
 * @see popup.js tpl-weaning
 */
export const WeaningPopup: React.FC<WeaningPopupProps> = ({ isOpen, onClose, data }) => {
    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="이유 실적"
            subtitle="지난주 예정 대비 및 이유 성적"
        >
            {/* 작업예정대비 섹션 */}
            <div className="popup-section-label">
                <span>작업예정대비 <span className="popup-section-desc">달성율 : 예정작업 대비</span></span>
                <span className="popup-section-desc">단위: 복</span>
            </div>
            <div className="overflow-x-auto">
                <table className="popup-table-01">
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>예정</th>
                            <th>이유</th>
                            <th>달성률</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="sum-row">
                            <td className="label">이유</td>
                            <td>{data.planned}</td>
                            <td className="total">{data.actual}</td>
                            <td className={parseInt(data.rate) >= 100 ? 'text-green-600' : 'text-red-600'}>
                                {data.rate}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 이유 성적 섹션 */}
            <div className="popup-section-label" style={{ marginTop: '16px' }}>
                <span>이유 성적</span>
                <span className="popup-section-desc">이유육성율: 실산대비</span>
            </div>
            <div className="overflow-x-auto">
                <table className="popup-table-01">
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>합계</th>
                            <th>평균</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label">이유두수</td>
                            <td>{data.stats.weanPigs.sum}</td>
                            <td>{data.stats.weanPigs.avg.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td className="label">분할이유</td>
                            <td>{data.stats.partialWean.sum}</td>
                            <td>{data.stats.partialWean.avg.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td className="label">평균체중</td>
                            <td>-</td>
                            <td>{data.stats.avgWeight.avg.toFixed(1)}kg</td>
                        </tr>
                        <tr className="sum-row">
                            <td className="label">이유육성율</td>
                            <td colSpan={2} className="text-green-600 total">{data.stats.survivalRate.rate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PopupContainer>
    );
};
