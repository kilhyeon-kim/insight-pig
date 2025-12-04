'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleInfo,
    faGrip,
    faWonSign,
    faCloudSun,
    faChevronDown,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';

export interface ExtraData {
    psy: {
        zone: string;
        status: string;
        value: number;
        delay: number;
    };
    price: {
        avg: number;
        max: number;
        min: number;
        source: string;
    };
    weather: {
        min: number;
        max: number;
        region: string;
    };
}

interface ExtraSectionProps {
    data: ExtraData;
    onPopupOpen?: (type: string) => void;
}

/**
 * 부가 정보 아코디언 섹션
 * @see weekly.html #secExtra
 */
export const ExtraSection: React.FC<ExtraSectionProps> = ({ data, onPopupOpen }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handlePopup = (type: string) => {
        if (onPopupOpen) {
            onPopupOpen(type);
        }
    };

    return (
        <div className={`info-accordion ${isOpen ? 'open' : ''}`} id="secExtra">
            {/* 아코디언 헤더 */}
            <div className="info-accordion-header" onClick={handleToggle}>
                <div className="info-accordion-title">
                    <FontAwesomeIcon icon={faCircleInfo} />
                    부가 정보
                </div>
                <div className="info-accordion-preview">
                    <span><FontAwesomeIcon icon={faGrip} /> {data.psy.zone}</span>
                    <span><FontAwesomeIcon icon={faWonSign} /> {data.price.avg.toLocaleString()}원</span>
                    <span><FontAwesomeIcon icon={faCloudSun} /> {data.weather.min}°/{data.weather.max}°</span>
                </div>
                <div className="info-accordion-toggle">
                    <FontAwesomeIcon icon={faChevronDown} />
                </div>
            </div>

            {/* 아코디언 바디 */}
            <div className="info-accordion-body">
                <div className="info-accordion-grid">
                    {/* PSY & 입력지연 카드 */}
                    <div className="info-accordion-card" id="cardPsy">
                        <div className="card-header">
                            <div className="card-title">
                                <FontAwesomeIcon icon={faGrip} /> PSY & 입력지연
                            </div>
                            <button className="card-more" onClick={() => handlePopup('psytrend')}>
                                <FontAwesomeIcon icon={faChartLine} />&nbsp;추이
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="section-left">
                                <div className="psy-value">
                                    {data.psy.zone} <span className="badge">{data.psy.status}</span>
                                </div>
                            </div>
                            <div className="section-right">
                                <div className="psy-desc">PSY {data.psy.value}</div>
                                <div className="psy-desc">입력지연 {data.psy.delay}일</div>
                            </div>
                        </div>
                    </div>

                    {/* 경락가격 카드 */}
                    <div className="info-accordion-card" id="cardPrice">
                        <div className="card-header">
                            <div className="card-title">
                                <FontAwesomeIcon icon={faWonSign} /> 경락가격(지난주)
                            </div>
                            <button className="card-more" onClick={() => handlePopup('auction')}>
                                <FontAwesomeIcon icon={faChartLine} />&nbsp;주간가격
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="section-left">
                                <div className="value-box">
                                    <div className="label">평균</div>
                                    <div className="value">{data.price.avg.toLocaleString()}원</div>
                                </div>
                                <div className="value-box">
                                    <div className="label">최고</div>
                                    <div className="value red">{data.price.max.toLocaleString()}원</div>
                                </div>
                                <div className="value-box">
                                    <div className="label">최저</div>
                                    <div className="value blue">{data.price.min.toLocaleString()}원</div>
                                </div>
                            </div>
                            <div className="section-right">
                                <div className="source-label">출처</div>
                                <div className="source-value">{data.price.source}</div>
                            </div>
                        </div>
                    </div>

                    {/* 오늘 날씨 카드 */}
                    <div className="info-accordion-card" id="cardWeather">
                        <div className="card-header">
                            <div className="card-title">
                                <FontAwesomeIcon icon={faCloudSun} /> 오늘 날씨
                            </div>
                            <button className="card-more" onClick={() => handlePopup('weather')}>
                                <FontAwesomeIcon icon={faChartLine} />&nbsp;주간날씨
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="section-left">
                                <div className="value-box">
                                    <div className="label">최저</div>
                                    <div className="value blue">{data.weather.min}°</div>
                                </div>
                                <div className="value-box">
                                    <div className="label">최고</div>
                                    <div className="value red">{data.weather.max}°</div>
                                </div>
                            </div>
                            <div className="section-right">
                                <div className="source-label">지역</div>
                                <div className="source-value">{data.weather.region}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
