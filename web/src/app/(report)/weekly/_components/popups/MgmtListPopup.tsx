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
 * - 리스트 아이템 클릭 시 상세 팝업으로 이동
 */
export const MgmtListPopup: React.FC<MgmtListPopupProps> = ({
    isOpen,
    onClose,
    title,
    items,
    onItemClick
}) => {
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
                                onClick={() => onItemClick(item)}
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
