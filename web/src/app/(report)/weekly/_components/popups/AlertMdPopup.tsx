import React from 'react';
import { AlertMdPopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';

interface AlertMdPopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: AlertMdPopupData[];
}

/**
 * 관리대상모돈 상세 팝업
 * @see popup.js tpl-alertMd
 * 테이블 형태: 초과일수(Y축) × 구분(X축) 교차표
 */
export const AlertMdPopup: React.FC<AlertMdPopupProps> = ({ isOpen, onClose, data }) => {
    // 컬럼별 합계 계산
    const totals = data.reduce(
        (acc, row) => ({
            hubo: acc.hubo + row.hubo,
            euMi: acc.euMi + row.euMi,
            sgMi: acc.sgMi + row.sgMi,
            bmDelay: acc.bmDelay + row.bmDelay,
            euDelay: acc.euDelay + row.euDelay,
        }),
        { hubo: 0, euMi: 0, sgMi: 0, bmDelay: 0, euDelay: 0 }
    );

    // 행별 합계 계산
    const getRowTotal = (row: AlertMdPopupData) =>
        row.hubo + row.euMi + row.sgMi + row.bmDelay + row.euDelay;

    const grandTotal = totals.hubo + totals.euMi + totals.sgMi + totals.bmDelay + totals.euDelay;

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title="관리대상모돈 상세 현황"
            subtitle="이유후/사고후 미교배 중점 관리"
        >
            <div className="overflow-x-auto">
                <table className="popup-table-01">
                    <thead>
                        <tr>
                            <th>초과일수</th>
                            <th>미교배<br />후보돈</th>
                            <th className="highlight">이유후<br />미교배돈</th>
                            <th className="highlight">사고후<br />미교배돈</th>
                            <th>교배후<br />분만지연돈</th>
                            <th>분만후<br />이유지연돈</th>
                            <th>합계</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td className="label">{row.period}</td>
                                <td>{row.hubo || '-'}</td>
                                <td className="highlight">{row.euMi || '-'}</td>
                                <td className="highlight">{row.sgMi || '-'}</td>
                                <td>{row.bmDelay || '-'}</td>
                                <td>{row.euDelay || '-'}</td>
                                <td className="total">{getRowTotal(row) || '-'}</td>
                            </tr>
                        ))}
                        <tr className="sum-row">
                            <td className="label">합계</td>
                            <td>{totals.hubo || '-'}</td>
                            <td className="highlight">{totals.euMi || '-'}</td>
                            <td className="highlight">{totals.sgMi || '-'}</td>
                            <td>{totals.bmDelay || '-'}</td>
                            <td>{totals.euDelay || '-'}</td>
                            <td className="total grand">{grandTotal}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="popup-tip">
                <div className="popup-tip-label">
                    <FontAwesomeIcon icon={faFire} /> 중점관리
                </div>
                <p className="popup-tip-text">이유후 미교배돈과 사고후 미교배돈을 중점적으로 관리해야 합니다.</p>
            </div>
        </PopupContainer>
    );
};
