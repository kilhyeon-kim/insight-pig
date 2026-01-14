import React, { useState, useRef, useEffect } from 'react';
import { ThisWeekData } from '@/types/weekly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarWeek,
    faArrowUpRightFromSquare,
    faHeart,
    faMagnifyingGlass,
    faBaby,
    faPersonBreastfeeding,
    faSyringe,
    faTruck,
    faLightbulb,
    faXmark,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import WeeklyScheduleSettings from '@/components/settings/WeeklyScheduleSettings';

interface ThisWeekSectionProps {
    data: ThisWeekData;
    farmNo?: number;
    onPopupOpen: (type: string) => void;
}

export const ThisWeekSection: React.FC<ThisWeekSectionProps> = ({ data, farmNo, onPopupOpen }) => {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const settingsPopupRef = useRef<HTMLDivElement>(null);

    // calendarGrid 데이터 사용 (프로토타입 _cal 구조)
    const grid = data.calendarGrid;

    // 툴팁 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setShowHelpTooltip(false);
            }
        };

        if (showHelpTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showHelpTooltip]);

    // 설정 팝업 ESC 키 닫기
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSettingsPopup(false);
            }
        };

        if (showSettingsPopup) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [showSettingsPopup]);

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
        <div className="report-card" id="sec-thisweek">
            <div className="card-header">
                <div className="card-header-top">
                    <div className="card-title">
                        <FontAwesomeIcon icon={faCalendarWeek} /> 금주 작업예정
                    </div>
                    <div className="card-date-wrap right horizontal">
                        <div className="card-badge">Week {grid?.weekNum ?? data?.summary?.matingGoal ?? ''}</div>
                        <div className="card-date">{grid?.periodFrom ?? ''} ~ {grid?.periodTo ?? ''}</div>
                    </div>
                </div>
                <div className="legend">
                    <div className="info-note-wrap" ref={tooltipRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto', position: 'relative' }}>
                        <div id="btn-schedule-help" className="info-note clickable lightbulb" onClick={() => setShowHelpTooltip(!showHelpTooltip)}>
                            금주 산출기준 <span className="icon-circle"><FontAwesomeIcon icon={faLightbulb} /></span>
                        </div>
                        {farmNo && (
                            <div
                                id="btn-schedule-settings"
                                className="info-note clickable"
                                onClick={() => setShowSettingsPopup(true)}
                                style={{ color: '#6b7280' }}
                                title="작업예정 설정 상세 보기"
                            >
                                설정 상세 <span className="icon-circle" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                                    <FontAwesomeIcon icon={faGear} />
                                </span>
                            </div>
                        )}
                        {/* 산출기준 툴팁 */}
                        {showHelpTooltip && (
                            <div className="help-tooltip" style={{ position: 'absolute', top: '100%', left: '0', zIndex: 100, marginTop: '4px' }}>
                        <div className="help-tooltip-header">
                            <span>작업별 산출기준(pigplan.io)</span>
                            <button className="close-btn" onClick={() => setShowHelpTooltip(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="help-tooltip-note">
                            [교배,분만,이유,모돈백신]&nbsp;:&nbsp;농장정보&gt;모돈 작업설정(피그플랜)
                            <br />
                            [출하]&nbsp;:&nbsp;농장정보&gt;농장 기본값설정(피그플랜)
                        </div>
                        <div className="help-tooltip-body">
                            <div className="help-item">
                                <span className="help-label">교배</span>
                                <span className="help-desc">{grid?.help?.mating || '설정된 예정작업정보 없음'}</span>
                            </div>
                            <div className="help-item">
                                <span className="help-label">재발확인</span>
                                <span className="help-desc">{grid?.help?.checking || '교배일+21일/28일'}</span>
                            </div>
                            <div className="help-item">
                                <span className="help-label">분만</span>
                                <span className="help-desc">{grid?.help?.farrowing || '설정된 예정작업정보 없음'}</span>
                            </div>
                            <div className="help-item">
                                <span className="help-label">이유</span>
                                <span className="help-desc">{grid?.help?.weaning || '설정된 예정작업정보 없음'}</span>
                            </div>
                            <div className="help-item">
                                <span className="help-label">모돈백신</span>
                                <span className="help-desc">{grid?.help?.vaccine || '설정된 예정작업정보 없음'}</span>
                            </div>
                            <div className="help-item">
                                <span className="help-label">출하</span>
                                <span className="help-desc" style={{ whiteSpace: 'pre-line' }}>{grid?.help?.shipment || '-'}</span>
                            </div>
                        </div>
                        <div className="help-tooltip-footer">
                            ※ 작업정보 및 설정값 변경은 pigplan.io에 접속하셔서 변경하십시요.
                        </div>
                            </div>
                        )}
                    </div>
                    <div className="legend-item"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /> 더보기</div>
                    <span className="section-desc">단위: 복</span>
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
                                <div key={i} className={`calendar-cell${count ? ' clickable' : ''}${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleGb')}>
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
                                <div key={i} className={`calendar-cell highlight${count ? ' clickable' : ''}${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleBm')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 재발확인(3주) */}
                        <div className="calendar-section">
                            <span className="section-label">재발<br />확인<br /><span className="section-sub">(3주)</span></span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.imsin3w?.[i];
                            return (
                                <div key={`3w-${i}`} className={`calendar-cell${i === 6 ? ' last-col' : ''}`}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 임신진단(4주) */}
                        <div className="calendar-section">
                            <span className="section-label">임신<br />진단<br /><span className="section-sub">(4주)</span></span>
                        </div>
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
                                <div key={i} className={`calendar-cell${count ? ' clickable' : ''}${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleEu')}>
                                    {count && <span className="count">{count}</span>}
                                </div>
                            );
                        })}

                        {/* 모돈백신 */}
                        <div className="calendar-section">
                            <span className="section-label">모돈<br />백신</span>
                        </div>
                        {weekDays.map((_, i) => {
                            const count = grid?.vaccine?.[i];
                            return (
                                <div key={i} className={`calendar-cell${count ? ' clickable' : ''}${i === 6 ? ' last-col' : ''}`} onClick={() => count && onPopupOpen('scheduleVaccine')}>
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

            {/* 작업예정 산정 방식 설정 팝업 */}
            {showSettingsPopup && farmNo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowSettingsPopup(false);
                        }
                    }}
                >
                    <div
                        ref={settingsPopupRef}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 팝업 헤더 */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    보고서 산출 설정
                                </h2>
                                <button
                                    onClick={() => setShowSettingsPopup(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                작업예정 산출 기준 (변경 시 차주 반영)
                            </p>
                        </div>
                        {/* 팝업 바디 */}
                        <WeeklyScheduleSettings
                            farmNo={farmNo}
                            showSaveButton={false}
                            readOnly={true}
                            onClose={() => setShowSettingsPopup(false)}
                        />
                        {/* 팝업 푸터 */}
                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                설정 변경은 <a href="/settings?tab=weekly" className="text-blue-600 dark:text-blue-400 hover:underline">환경설정 &gt; 주간보고서</a>에서 가능합니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
