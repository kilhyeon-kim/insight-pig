import React from 'react';
import { ThisWeekData } from '@/types/weekly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck,
    faArrowUpRightFromSquare,
    faHeart,
    faMagnifyingGlass,
    faBaby,
    faPersonBreastfeeding,
    faSyringe,
    faTruck,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

interface ThisWeekSectionProps {
    data: ThisWeekData;
    onPopupOpen: (type: string) => void;
}

export const ThisWeekSection: React.FC<ThisWeekSectionProps> = ({ data, onPopupOpen }) => {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

    // calendarGrid 데이터 사용 (프로토타입 _cal 구조)
    const grid = data.calendarGrid;

    // 요약 카드 데이터
    const summaryData = {
        mating: grid?.gbSum ?? 0,
        checking: grid?.imsinSum ?? 0,
        farrowing: grid?.bmSum ?? 0,
        weaning: grid?.euSum ?? 0,
        vaccine: grid?.vaccineSum ?? 0,
        shipment: grid?.shipSum ?? 0,
    };

    return (
        <div className="report-card" id="secThisWeek">
            <div className="card-header">
                <div className="card-header-top">
                    <div className="card-title">
                        <FontAwesomeIcon icon={faCalendarCheck} /> 금주 작업예정
                    </div>
                    <div className="card-date-wrap right horizontal">
                        <div className="card-badge">Week {grid?.weekNum ?? data.summary.matingGoal}</div>
                        <div className="card-date">{grid?.periodFrom ?? ''} ~ {grid?.periodTo ?? ''}</div>
                    </div>
                </div>
                <div className="legend">
                    <div className="legend-item"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /> 더보기</div>
                    <span className="section-desc">단위: 복</span>
                </div>
                <div className="info-note">
                    <FontAwesomeIcon icon={faCircleInfo} /> 산출기준: 예정작업 미존재시 농장 기본값, [재발확인] 3,4주 고정
                </div>
            </div>
            <div className="card-body">
                {/* 주간 요약 카드 */}
                <div className="summary-section">
                    <div className="summary-card clickable" onClick={() => onPopupOpen('scheduleGb')}>
                        <span className="detail-btn"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span>
                        <div className="icon"><FontAwesomeIcon icon={faHeart} /></div>
                        <div className="title">교배</div>
                        <div className="count">{summaryData.mating}</div>
                    </div>
                    <div className="summary-card">
                        <div className="icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></div>
                        <div className="title">재발확인</div>
                        <div className="count">{summaryData.checking}</div>
                    </div>
                    <div className="summary-card clickable" onClick={() => onPopupOpen('scheduleBm')}>
                        <span className="detail-btn"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span>
                        <div className="icon"><FontAwesomeIcon icon={faBaby} /></div>
                        <div className="title">분만</div>
                        <div className="count">{summaryData.farrowing}</div>
                    </div>
                    <div className="summary-card clickable" onClick={() => onPopupOpen('scheduleEu')}>
                        <span className="detail-btn"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span>
                        <div className="icon"><FontAwesomeIcon icon={faPersonBreastfeeding} /></div>
                        <div className="title">이유</div>
                        <div className="count">{summaryData.weaning}</div>
                    </div>
                    <div className="summary-card clickable" onClick={() => onPopupOpen('scheduleVaccine')}>
                        <span className="detail-btn"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span>
                        <div className="icon"><FontAwesomeIcon icon={faSyringe} /></div>
                        <div className="title">모돈백신</div>
                        <div className="count">{summaryData.vaccine}</div>
                    </div>
                    <div className="summary-card">
                        <div className="icon"><FontAwesomeIcon icon={faTruck} /></div>
                        <div className="title">출하</div>
                        <div className="count">{summaryData.shipment}</div>
                    </div>
                </div>

                {/* 캘린더 그리드 */}
                <div className="schedule-card">
                    <div className="calendar-grid">
                        {/* 헤더 */}
                        <div className="calendar-header corner">작업</div>
                        {weekDays.map((day, i) => (
                            <div key={i} className="calendar-header">
                                <span className="day-name">{day}</span>
                                <div className="day-num">{grid?.dates?.[i] ?? ''}</div>
                            </div>
                        ))}

                        {/* 교배 */}
                        <div className="calendar-section">
                            <span className="section-label">교배</span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.gb?.[i];
                            return (
                                <div key={i} className={`calendar-cell${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleGb')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 분만 (강조색) */}
                        <div className="calendar-section">
                            <span className="section-label">분만</span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.bm?.[i];
                            return (
                                <div key={i} className={`calendar-cell highlight${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleBm')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 재발확인 - row-span-4로 4행 차지 */}
                        <div className="calendar-section row-span-4">
                            <span className="section-label">재발<br/>확인</span>
                        </div>
                        {/* 3주 라벨 - span 7 */}
                        <div className="calendar-row-label">3주</div>
                        {/* 3주 셀들 */}
                        {weekDays.map((_, i) => {
                            const count = grid?.imsin3w?.[i];
                            return (
                                <div key={`3w-${i}`} className={`calendar-cell${i === 6 ? ' last-col' : ''}`}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}
                        {/* 4주 라벨 - span 7 */}
                        <div className="calendar-row-label">4주</div>
                        {/* 4주 셀들 */}
                        {weekDays.map((_, i) => {
                            const count = grid?.imsin4w?.[i];
                            return (
                                <div key={`4w-${i}`} className={`calendar-cell${i === 6 ? ' last-col' : ''}`}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 이유 */}
                        <div className="calendar-section">
                            <span className="section-label">이유</span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.eu?.[i];
                            return (
                                <div key={i} className={`calendar-cell${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleEu')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 모돈백신 */}
                        <div className="calendar-section">
                            <span className="section-label">모돈<br/>백신</span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.vaccine?.[i];
                            return (
                                <div key={i} className={`calendar-cell${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleVaccine')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 출하 (병합) */}
                        <div className="calendar-section last-row">
                            <span className="section-label">출하</span>
                        </div>
                        <div className="calendar-cell merged last-row">
                            {(grid?.ship ?? 0) > 0 && <><span className="count">{grid?.ship}</span><span className="unit">두</span></>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
