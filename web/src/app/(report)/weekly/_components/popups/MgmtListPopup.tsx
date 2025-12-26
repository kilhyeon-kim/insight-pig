import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faExternalLinkAlt, faQuestionCircle, faBullhorn, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { PopupContainer } from './PopupContainer';
import { MgmtItem } from '@/types/weekly';

// 타입별 아이콘 반환
const getMgmtTypeIcon = (mgmtType: string) => {
    switch (mgmtType) {
        case 'QUIZ': return faQuestionCircle;
        case 'CHANNEL': return faBullhorn;  // 박사채널&정보
        default: return faLightbulb;
    }
};

interface MgmtListPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: MgmtItem[];
    onItemClick: (item: MgmtItem) => void;
}

/**
 * 관리포인트 전체 리스트 팝업
 * - QUIZ/CHANNEL: 링크 있으면 새 탭, 없으면 상세 팝업
 * - PORK-NEWS: DIRECT이면 새 탭, POPUP이면 상세 팝업
 */
export const MgmtListPopup: React.FC<MgmtListPopupProps> = ({
    isOpen,
    onClose,
    title,
    items,
    onItemClick
}) => {
    // 아이템 클릭 핸들러
    const handleItemClick = (item: MgmtItem) => {
        // PORK-NEWS는 POPUP/DIRECT 구분
        if (item.mgmtType === 'PORK-NEWS') {
            if (item.linkTarget === 'DIRECT' && item.link) {
                window.open(item.link, '_blank', 'noopener,noreferrer');
                return;
            }
            // POPUP이거나 링크 없으면 상세 팝업
            onItemClick(item);
            return;
        }

        // QUIZ/CHANNEL: 링크 있으면 새 탭, 없으면 상세 팝업
        if (item.link) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
            return;
        }
        onItemClick(item);
    };

    // DIRECT 링크인지 확인 (외부 링크 아이콘 표시용)
    const isDirectLink = (item: MgmtItem): boolean => {
        if (item.mgmtType === 'PORK-NEWS') {
            return item.linkTarget === 'DIRECT' && !!item.link;
        }
        return !!item.link;
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            id="popup-mgmt-list"
            maxWidth="max-w-lg"
        >
            <div className="mgmt-list-popup-content">
                {items.length === 0 ? (
                    <div className="mgmt-list-empty">
                        등록된 항목이 없습니다.
                    </div>
                ) : (
                    <ul className="mgmt-list-items">
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className="mgmt-list-item"
                                onClick={() => handleItemClick(item)}
                            >
                                <span className={`mgmt-list-item-icon mgmt-list-item-icon-${item.mgmtType?.toLowerCase() || 'quiz'}`}>
                                    <FontAwesomeIcon icon={getMgmtTypeIcon(item.mgmtType)} />
                                </span>
                                <span className="mgmt-list-item-title">{item.title}</span>
                                {isDirectLink(item) ? (
                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mgmt-list-item-link" />
                                ) : (
                                    <FontAwesomeIcon icon={faChevronRight} className="mgmt-list-item-arrow" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PopupContainer>
    );
};
