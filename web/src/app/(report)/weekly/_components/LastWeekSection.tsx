import React from 'react';
import { LastWeekData } from '@/types/weekly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faArrowUpRightFromSquare, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '@/utils/format';

interface LastWeekSectionProps {
    data: LastWeekData;
    onPopupOpen: (type: string) => void;
}

export const LastWeekSection: React.FC<LastWeekSectionProps> = ({ data, onPopupOpen }) => {
    return (
        <div className="report-card" id="secLastWeek">
            <div className="card-header">
                <div className="card-header-top">
                    <div className="card-title">
                        <FontAwesomeIcon icon={faClipboardList} /> 지난주 주요실적
                    </div>
                    <div className="card-date-wrap right horizontal">
                        <div className="card-badge">Week {data.period.weekNum}</div>
                        <div className="card-date">{data.period.from} ~ {data.period.to}</div>
                    </div>
                </div>
                <div className="legend">
                    <div className="legend-item"><span className="legend-dot orange"></span> 누계(당해년도)</div>
                    <div className="legend-item"><FontAwesomeIcon icon={faCaretUp} className="up" /><FontAwesomeIcon icon={faCaretDown} className="down" /> 증감(1년평균 대비)</div>
                    <div className="legend-item"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /> 더보기</div>
                </div>
            </div>
            <div className="card-body">
                <div className="result-grid">
                    {/* 헤더 */}
                    <div className="cell header span-2 row-span-2">작업/세부</div>
                    <div className="cell header-main span-2">지난주</div>
                    <div className="cell header-accent span-2">누계(25.1.1~)</div>
                    <div className="cell header lastweek">두수</div>
                    <div className="cell header lastweek">평균</div>
                    <div className="cell header">두수</div>
                    <div className="cell header">평균</div>

                    {/* 모돈 */}
                    <div className="cell label row-span-2 clickable" onClick={() => onPopupOpen('modon')}>
                        모돈<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub">현재모돈</div>
                    <div className="cell count lastweek">{formatNumber(data.modon.regCnt)}</div>
                    <div className="cell empty lastweek"></div>
                    <div className="cell empty"></div>
                    <div className="cell empty"></div>

                    <div className="cell sub">상시모돈</div>
                    <div className="cell count lastweek">{formatNumber(data.modon.sangsiCnt)}</div>
                    <div className="cell empty lastweek"></div>
                    <div className="cell empty"></div>
                    <div className="cell empty"></div>

                    {/* 교배 */}
                    <div className="cell label clickable section-start" onClick={() => onPopupOpen('mating')}>
                        교배<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">복수</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.mating.cnt)}</div>
                    <div className="cell empty lastweek section-start"></div>
                    <div className="cell count section-start">{formatNumber(data.mating.sum)}</div>
                    <div className="cell empty section-start"></div>

                    {/* 분만 */}
                    <div className="cell label row-span-3 clickable section-start" onClick={() => onPopupOpen('farrowing')}>
                        분만<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">복수</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.farrowing.cnt)}</div>
                    <div className="cell empty lastweek section-start"></div>
                    <div className="cell count section-start">{formatNumber(data.farrowing.sumCnt)}</div>
                    <div className="cell empty section-start"></div>

                    <div className="cell sub">총산자수</div>
                    <div className="cell count lastweek">{formatNumber(data.farrowing.totalCnt)}</div>
                    <div className="cell avg lastweek">
                        <span>{data.farrowing.avgTotal?.toFixed(1)}</span>
                        {data.farrowing.changeTotal !== undefined && data.farrowing.changeTotal !== 0 && (
                            <span className={`change-wrap ${data.farrowing.changeTotal > 0 ? 'up' : 'down'}`}>
                                <FontAwesomeIcon icon={data.farrowing.changeTotal > 0 ? faCaretUp : faCaretDown} />
                                {Math.abs(data.farrowing.changeTotal).toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="cell count">{formatNumber(data.farrowing.sumTotalCnt)}</div>
                    <div className="cell avg">{data.farrowing.sumAvgTotal?.toFixed(1)}</div>

                    <div className="cell sub">실산자수</div>
                    <div className="cell count lastweek">{formatNumber(data.farrowing.liveCnt)}</div>
                    <div className="cell avg lastweek">
                        <span>{data.farrowing.avgLive?.toFixed(1)}</span>
                        {data.farrowing.changeLive !== undefined && data.farrowing.changeLive !== 0 && (
                            <span className={`change-wrap ${data.farrowing.changeLive > 0 ? 'up' : 'down'}`}>
                                <FontAwesomeIcon icon={data.farrowing.changeLive > 0 ? faCaretUp : faCaretDown} />
                                {Math.abs(data.farrowing.changeLive).toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="cell count">{formatNumber(data.farrowing.sumLiveCnt)}</div>
                    <div className="cell avg">{data.farrowing.sumAvgLive?.toFixed(1)}</div>

                    {/* 이유 */}
                    <div className="cell label row-span-2 clickable section-start" onClick={() => onPopupOpen('weaning')}>
                        이유<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">복수</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.weaning.cnt)}</div>
                    <div className="cell empty lastweek section-start"></div>
                    <div className="cell count section-start">{formatNumber(data.weaning.sumCnt)}</div>
                    <div className="cell empty section-start"></div>

                    <div className="cell sub">이유자돈수</div>
                    <div className="cell count lastweek">{formatNumber(data.weaning.jdCnt)}</div>
                    <div className="cell avg lastweek">
                        <span>{data.weaning.avgWeight?.toFixed(1)}</span>
                        {data.weaning.changeWeight !== undefined && data.weaning.changeWeight !== 0 && (
                            <span className={`change-wrap ${data.weaning.changeWeight > 0 ? 'up' : 'down'}`}>
                                <FontAwesomeIcon icon={data.weaning.changeWeight > 0 ? faCaretUp : faCaretDown} />
                                {Math.abs(data.weaning.changeWeight).toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="cell count">{formatNumber(data.weaning.sumJdCnt)}</div>
                    <div className="cell avg">{data.weaning.sumAvgWeight?.toFixed(1)}</div>

                    {/* 사고 */}
                    <div className="cell label clickable section-start" onClick={() => onPopupOpen('accident')}>
                        사고<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">교배후 사고<br className="mobile-br"/>(복수)</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.accident.cnt)}</div>
                    <div className="cell empty lastweek section-start"></div>
                    <div className="cell count section-start">{formatNumber(data.accident.sum)}</div>
                    <div className="cell empty section-start"></div>

                    {/* 도태폐사 */}
                    <div className="cell label clickable section-start" onClick={() => onPopupOpen('culling')}>
                        도태<br className="mobile-br"/>폐사<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">모돈 도폐사</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.culling.cnt)}</div>
                    <div className="cell empty lastweek section-start"></div>
                    <div className="cell count section-start">{formatNumber(data.culling.sum)}</div>
                    <div className="cell empty section-start"></div>

                    {/* 출하 */}
                    <div className="cell label clickable section-start" onClick={() => onPopupOpen('shipment')}>
                        출하<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="detail-icon fa-sm" />
                    </div>
                    <div className="cell sub section-start">복수/<br className="mobile-br"/>평균체중</div>
                    <div className="cell count lastweek section-start">{formatNumber(data.shipment.cnt)}</div>
                    <div className="cell avg lastweek section-start">
                        <span>{data.shipment.avg?.toFixed(1)}</span>
                        <span className="sub-label">(평체)</span>
                    </div>
                    <div className="cell count section-start">{formatNumber(data.shipment.sum)}</div>
                    <div className="cell avg section-start">
                        <span>{data.shipment.avgSum?.toFixed(1)}</span>
                        <span className="sub-label">(평체)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LastWeekSection;
