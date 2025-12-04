import React from 'react';
import { FarrowingPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface FarrowingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: FarrowingPopupData;
}

/**
 * 분만 실적 팝업 (탭 없음)
 * - 섹션1: 작업예정대비 테이블
 * - 섹션2: 분만 성적 테이블
 * @see popup.js tpl-farrowing
 */
export const FarrowingPopup: React.FC<FarrowingPopupProps> = ({ isOpen, onClose, data }) => {
    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="분만 실적"
            subtitle="지난주 예정 대비 및 분만 성적"
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
                            <th>분만</th>
                            <th>달성률</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="sum-row">
                            <td className="label">분만</td>
                            <td>{data.planned}</td>
                            <td className="total">{data.actual}</td>
                            <td className={parseInt(data.rate) >= 100 ? 'text-green-600' : 'text-red-600'}>
                                {data.rate}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 분만 성적 섹션 */}
            <div className="popup-section-label" style={{ marginTop: '16px' }}>
                <span>분만 성적</span>
                <span className="popup-section-desc">비율: 총산대비</span>
            </div>
            <div className="overflow-x-auto">
                <table className="popup-table-01">
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>합계</th>
                            <th>평균</th>
                            <th>비율</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label">총산</td>
                            <td>{data.stats.totalBorn.sum}</td>
                            <td>{data.stats.totalBorn.avg.toFixed(1)}</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td className="label">실산</td>
                            <td>{data.stats.bornAlive.sum}</td>
                            <td>{data.stats.bornAlive.avg.toFixed(1)}</td>
                            <td className="text-green-600">{data.stats.bornAlive.rate}</td>
                        </tr>
                        <tr>
                            <td className="label">사산</td>
                            <td>{data.stats.stillborn.sum}</td>
                            <td>{data.stats.stillborn.avg.toFixed(1)}</td>
                            <td className="text-red-600">{data.stats.stillborn.rate}</td>
                        </tr>
                        <tr>
                            <td className="label">미라</td>
                            <td>{data.stats.mummy.sum}</td>
                            <td>{data.stats.mummy.avg.toFixed(1)}</td>
                            <td className="text-red-600">{data.stats.mummy.rate}</td>
                        </tr>
                        <tr>
                            <td className="label">자돈폐사</td>
                            <td>{data.stats.culling.sum}</td>
                            <td>{data.stats.culling.avg.toFixed(1)}</td>
                            <td className="text-red-600">{data.stats.culling.rate}</td>
                        </tr>
                        <tr className="sum-row">
                            <td className="label">포유개시</td>
                            <td className="total">{data.stats.nursingStart.sum}</td>
                            <td>{data.stats.nursingStart.avg.toFixed(1)}</td>
                            <td className="text-green-600">{data.stats.nursingStart.rate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PopupContainer>
    );
};
