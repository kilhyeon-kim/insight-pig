import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faNewspaper, faQuestionCircle, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MgmtItem, MgmtData } from '@/types/weekly';
import { MgmtListPopup } from './popups/MgmtListPopup';
import { MgmtDetailPopup } from './popups/MgmtDetailPopup';

interface MgmtSectionProps {
    data: MgmtData;
}

type MgmtType = 'quiz' | 'highlight' | 'recommend';

/**
 * 현재 시기 관리 포인트 섹션
 * 컴팩트 칩 스타일 - 3개 카드: 퀴즈, 중점사항, 한돈&업계소식
 * - 칩 클릭: 상세 팝업
 * - 더보기 클릭: 전체 리스트 팝업
 */
export const MgmtSection: React.FC<MgmtSectionProps> = ({ data }) => {
    // 리스트 팝업 상태
    const [listPopupOpen, setListPopupOpen] = useState(false);
    const [listPopupType, setListPopupType] = useState<MgmtType>('quiz');

    // 상세 팝업 상태
    const [detailPopupOpen, setDetailPopupOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<MgmtItem | null>(null);

    // 더보기 클릭 - 리스트 팝업 열기
    const openListPopup = (type: MgmtType) => {
        setListPopupType(type);
        setListPopupOpen(true);
    };

    // 칩/리스트 아이템 클릭 - 상세 팝업 열기
    const openDetailPopup = (item: MgmtItem) => {
        setDetailItem(item);
        setDetailPopupOpen(true);
    };

    const getListPopupTitle = (): string => {
        switch (listPopupType) {
            case 'quiz': return '퀴즈';
            case 'highlight': return '안박사 채널';
            case 'recommend': return '한돈&업계소식';
            default: return '';
        }
    };

    const getListPopupItems = (): MgmtItem[] => {
        switch (listPopupType) {
            case 'quiz': return data.quizList || [];
            case 'highlight': return data.highlightList || [];
            case 'recommend': return data.recommendList || [];
            default: return [];
        }
    };

    // 카드에 표시할 아이템 수 (최대 3개)
    const maxDisplayItems = 3;

    // 칩 텍스트 자르기 (20자)
    const truncateText = (text: string, maxLength: number = 20) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '…';
    };

    return (
        <div className="mgmt-section-v2" id="sec-mgmt">
            {/* 퀴즈 */}
            <div className="mgmt-card-v2">
                <div className="mgmt-card-header">
                    <span className="mgmt-badge quiz">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                        퀴즈
                    </span>
                    <span className="mgmt-more" onClick={() => openListPopup('quiz')}>
                        더보기 <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                </div>
                <div className="mgmt-chips">
                    {(data.quizList || []).length > 0 ? (
                        (data.quizList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <span
                                key={index}
                                className="mgmt-chip"
                                onClick={() => openDetailPopup(item)}
                            >
                                {truncateText(item.title)}
                            </span>
                        ))
                    ) : (
                        <span className="mgmt-empty">등록된 퀴즈가 없습니다</span>
                    )}
                </div>
            </div>

            {/* 중점사항 */}
            <div className="mgmt-card-v2">
                <div className="mgmt-card-header">
                    <span className="mgmt-badge highlight">
                        <FontAwesomeIcon icon={faStar} />
                        안박사 채널
                    </span>
                    <span className="mgmt-more" onClick={() => openListPopup('highlight')}>
                        더보기 <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                </div>
                <div className="mgmt-chips">
                    {(data.highlightList || []).length > 0 ? (
                        (data.highlightList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <span
                                key={index}
                                className="mgmt-chip"
                                onClick={() => openDetailPopup(item)}
                            >
                                {truncateText(item.title)}
                            </span>
                        ))
                    ) : (
                        <span className="mgmt-empty">등록된 콘텐츠가 없습니다</span>
                    )}
                </div>
            </div>

            {/* 한돈&업계소식 */}
            <div className="mgmt-card-v2">
                <div className="mgmt-card-header">
                    <span className="mgmt-badge news">
                        <FontAwesomeIcon icon={faNewspaper} />
                        한돈&업계소식
                    </span>
                    <span className="mgmt-more" onClick={() => openListPopup('recommend')}>
                        더보기 <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                </div>
                <div className="mgmt-chips">
                    {(data.recommendList || []).length > 0 ? (
                        (data.recommendList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <span
                                key={index}
                                className="mgmt-chip"
                                onClick={() => openDetailPopup(item)}
                            >
                                {truncateText(item.title)}
                            </span>
                        ))
                    ) : (
                        <span className="mgmt-empty">등록된 소식이 없습니다</span>
                    )}
                </div>
            </div>

            {/* 전체 리스트 팝업 */}
            <MgmtListPopup
                isOpen={listPopupOpen}
                onClose={() => setListPopupOpen(false)}
                title={getListPopupTitle()}
                items={getListPopupItems()}
                onItemClick={(item) => {
                    setListPopupOpen(false);
                    openDetailPopup(item);
                }}
            />

            {/* 상세 팝업 */}
            <MgmtDetailPopup
                isOpen={detailPopupOpen}
                onClose={() => setDetailPopupOpen(false)}
                item={detailItem}
            />
        </div>
    );
};
