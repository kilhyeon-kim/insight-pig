import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { PopupContainer } from './PopupContainer';
import { MgmtItem } from '@/types/weekly';

interface MgmtListPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: MgmtItem[];
    onItemClick: (item: MgmtItem) => void;
}

/**
 * 관리포인트 전체 리스트 팝업
 * - 링크가 있는 아이템: 바로 링크 열기
 * - 링크가 없는 아이템: 상세 팝업으로 이동
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
        // 링크가 있으면 바로 열기
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
        // 링크가 없으면 상세 팝업
        onItemClick(item);
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
                                <span className="mgmt-list-item-num">{index + 1}</span>
                                <span className="mgmt-list-item-title">{item.title}</span>
                                {item.link ? (
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
