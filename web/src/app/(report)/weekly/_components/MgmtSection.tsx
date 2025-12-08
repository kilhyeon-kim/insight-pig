import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faStar, faBook } from '@fortawesome/free-solid-svg-icons';

export interface MgmtItem {
    text: string;
    link: string | null;
}

export interface MgmtData {
    highlightList: MgmtItem[];
    recommendList: MgmtItem[];
}

interface MgmtSectionProps {
    data: MgmtData;
}

/**
 * 현재 시기 관리 포인트 섹션
 * @see weekly.html #secMgmt
 */
export const MgmtSection: React.FC<MgmtSectionProps> = ({ data }) => {
    return (
        <div className="mgmt-section" id="sec-mgmt">
            <div className="section-title">
                <FontAwesomeIcon icon={faCalendarCheck} />
                현재 시기 관리 포인트
            </div>
            <div className="mgmt-cards">
                {/* 중점사항 카드 */}
                <div className="mgmt-card highlight">
                    <div className="card-header">
                        <div className="card-icon">
                            <FontAwesomeIcon icon={faStar} />
                        </div>
                        <div className="card-title">11월 말~12월 중점사항</div>
                    </div>
                    <ul className="card-list">
                        {data.highlightList.map((item, index) => (
                            <li key={index}>
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.text}
                                    </a>
                                ) : (
                                    item.text
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 추천 학습 자료 카드 */}
                <div className="mgmt-card recommend">
                    <div className="card-header">
                        <div className="card-icon">
                            <FontAwesomeIcon icon={faBook} />
                        </div>
                        <div className="card-title">추천 학습 자료</div>
                    </div>
                    <ul className="card-list">
                        {data.recommendList.map((item, index) => (
                            <li key={index}>
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.text}
                                    </a>
                                ) : (
                                    item.text
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
