import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faNewspaper, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MgmtItem, MgmtData } from '@/types/weekly';
import { MgmtListPopup } from './popups/MgmtListPopup';
import { MgmtDetailPopup } from './popups/MgmtDetailPopup';

interface MgmtSectionProps {
    data: MgmtData;
}

type MgmtType = 'quizInfo' | 'news';

/**
 * 현재 시기 관리 포인트 섹션
 * 2개 카드: 피그플랜 퀴즈&정보 (퀴즈+안박사채널), 한돈&업계소식
 * - 칩 클릭: 상세 팝업
 * - 더보기 클릭: 전체 리스트 팝업
 */
export const MgmtSection: React.FC<MgmtSectionProps> = ({ data }) => {
    // 리스트 팝업 상태
    const [listPopupOpen, setListPopupOpen] = useState(false);
    const [listPopupType, setListPopupType] = useState<MgmtType>('quizInfo');

    // 상세 팝업 상태
    const [detailPopupOpen, setDetailPopupOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<MgmtItem | null>(null);

    // 퀴즈 + 안박사채널 통합 리스트
    const quizInfoList = [
        ...(data.quizList || []),
        ...(data.highlightList || [])
    ];

    // 더보기 클릭 - 리스트 팝업 열기
    const openListPopup = (type: MgmtType) => {
        setListPopupType(type);
        setListPopupOpen(true);
    };

    // 칩/리스트 아이템 클릭 핸들러
    // - 링크가 있으면 바로 링크 열기
    // - 링크가 없으면 상세 팝업 열기
    const handleItemClick = (item: MgmtItem) => {
        if (item.link) {
            if (item.linkTarget === 'DIRECT') {
                window.open(item.link, '_blank', 'noopener,noreferrer');
            } else {
                const width = 800;
                const height = 600;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;
                window.open(
                    item.link,
                    'mgmt_popup',
                    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
                );
            }
            return;
        }
        setDetailItem(item);
        setDetailPopupOpen(true);
    };

    const getListPopupTitle = (): string => {
        switch (listPopupType) {
            case 'quizInfo': return '피그플랜 퀴즈&정보';
            case 'news': return '한돈&업계소식';
            default: return '';
        }
    };

    const getListPopupItems = (): MgmtItem[] => {
        switch (listPopupType) {
            case 'quizInfo': return quizInfoList;
            case 'news': return data.recommendList || [];
            default: return [];
        }
    };

    // 카드에 표시할 아이템 수 (최대 3개)
    const maxDisplayItems = 3;

    // 칩 텍스트 자르기 (40자)
    const truncateText = (text: string, maxLength: number = 40) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '…';
    };

    return (
        <div className="mgmt-section-v2">
            {/* 피그플랜 퀴즈&정보 (퀴즈 + 안박사채널 통합) */}
            <div className="mgmt-card-v2" id="sec-mgmt-quiz">
                <div className="mgmt-card-header">
                    <span className="mgmt-badge quiz-info">
                        <FontAwesomeIcon icon={faLightbulb} />
                        피그플랜 퀴즈&정보
                    </span>
                    <span className="mgmt-more" onClick={() => openListPopup('quizInfo')}>
                        더보기 <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                </div>
                <div className="mgmt-chips">
                    {quizInfoList.length > 0 ? (
                        quizInfoList.slice(0, maxDisplayItems).map((item, index) => (
                            <span
                                key={index}
                                className="mgmt-chip"
                                onClick={() => handleItemClick(item)}
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
            <div className="mgmt-card-v2" id="sec-mgmt-news">
                <div className="mgmt-card-header">
                    <span className="mgmt-badge news">
                        <FontAwesomeIcon icon={faNewspaper} />
                        한돈&업계소식
                    </span>
                    <span className="mgmt-more" onClick={() => openListPopup('news')}>
                        더보기 <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                </div>
                <div className="mgmt-chips">
                    {(data.recommendList || []).length > 0 ? (
                        (data.recommendList || []).slice(0, maxDisplayItems).map((item, index) => (
                            <span
                                key={index}
                                className="mgmt-chip"
                                onClick={() => handleItemClick(item)}
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
                    // 링크가 없는 경우만 호출됨 (링크는 MgmtListPopup 내부에서 처리)
                    setListPopupOpen(false);
                    setDetailItem(item);
                    setDetailPopupOpen(true);
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
