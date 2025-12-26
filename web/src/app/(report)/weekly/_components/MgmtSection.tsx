import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faStar, faBook, faQuestionCircle, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MgmtItem, MgmtData } from '@/types/weekly';
import { MgmtPopup } from './popups/MgmtPopup';

interface MgmtSectionProps {
    data: MgmtData;
}

type MgmtType = 'quiz' | 'highlight' | 'recommend';

/**
 * 현재 시기 관리 포인트 섹션
 * 3개 카드: 퀴즈, 중점사항, 추천학습자료
 * @see weekly.html #secMgmt
 */
export const MgmtSection: React.FC<MgmtSectionProps> = ({ data }) => {
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupType, setPopupType] = useState<MgmtType>('quiz');

    const openPopup = (type: MgmtType) => {
        setPopupType(type);
        setPopupOpen(true);
    };

    const getPopupTitle = (): string => {
        switch (popupType) {
            case 'quiz': return '퀴즈';
            case 'highlight': return '중점사항';
            case 'recommend': return '추천 학습 자료';
            default: return '';
        }
    };

    const getPopupItems = (): MgmtItem[] => {
        switch (popupType) {
            case 'quiz': return data.quizList || [];
            case 'highlight': return data.highlightList || [];
            case 'recommend': return data.recommendList || [];
            default: return [];
        }
    };

    // 카드에 표시할 아이템 수 (최대 3개)
    const maxDisplayItems = 3;

    return (
        <div className="mgmt-section" id="sec-mgmt">
            <div className="section-title">
                <FontAwesomeIcon icon={faCalendarCheck} />
                현재 시기 관리 포인트
            </div>
            <div className="mgmt-cards mgmt-cards-3">
                {/* 퀴즈 카드 */}
                <div id="card-mgmt-quiz" className="mgmt-card quiz">
                    <div className="card-header" onClick={() => openPopup('quiz')}>
                        <div className="card-icon">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                        </div>
                        <div className="card-title">퀴즈</div>
                        <div className="card-more">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                    </div>
                    <ul className="card-list">
                        {(data.quizList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <li key={index} onClick={() => openPopup('quiz')}>
                                <span className="item-title">{item.title}</span>
                            </li>
                        ))}
                        {(!data.quizList || data.quizList.length === 0) && (
                            <li className="empty-item">등록된 퀴즈가 없습니다</li>
                        )}
                    </ul>
                </div>

                {/* 중점사항 카드 */}
                <div id="card-mgmt-highlight" className="mgmt-card highlight">
                    <div className="card-header" onClick={() => openPopup('highlight')}>
                        <div className="card-icon">
                            <FontAwesomeIcon icon={faStar} />
                        </div>
                        <div className="card-title">중점사항</div>
                        <div className="card-more">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                    </div>
                    <ul className="card-list">
                        {(data.highlightList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <li key={index} onClick={() => openPopup('highlight')}>
                                <span className="item-title">{item.title}</span>
                            </li>
                        ))}
                        {(!data.highlightList || data.highlightList.length === 0) && (
                            <li className="empty-item">등록된 중점사항이 없습니다</li>
                        )}
                    </ul>
                </div>

                {/* 추천 학습 자료 카드 */}
                <div id="card-mgmt-recommend" className="mgmt-card recommend">
                    <div className="card-header" onClick={() => openPopup('recommend')}>
                        <div className="card-icon">
                            <FontAwesomeIcon icon={faBook} />
                        </div>
                        <div className="card-title">추천 학습 자료</div>
                        <div className="card-more">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                    </div>
                    <ul className="card-list">
                        {(data.recommendList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <li key={index} onClick={() => openPopup('recommend')}>
                                <span className="item-title">{item.title}</span>
                            </li>
                        ))}
                        {(!data.recommendList || data.recommendList.length === 0) && (
                            <li className="empty-item">등록된 학습 자료가 없습니다</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* 관리포인트 팝업 */}
            <MgmtPopup
                isOpen={popupOpen}
                onClose={() => setPopupOpen(false)}
                title={getPopupTitle()}
                items={getPopupItems()}
            />
        </div>
    );
};
