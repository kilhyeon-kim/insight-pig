import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PopupContainer } from './PopupContainer';
import { MgmtItem } from '@/types/weekly';

interface MgmtPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: MgmtItem[];
}

/**
 * 관리포인트 상세 팝업 (퀴즈/중점사항/추천학습자료)
 */
export const MgmtPopup: React.FC<MgmtPopupProps> = ({
    isOpen,
    onClose,
    title,
    items
}) => {
    // 날짜 포맷팅 (YYYYMMDD -> YYYY.MM.DD)
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    // 링크 클릭 핸들러
    const handleLinkClick = (item: MgmtItem) => {
        if (!item.link) return;

        if (item.linkTarget === 'DIRECT') {
            // 새 탭에서 바로 열기
            window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
            // 팝업 윈도우로 열기 (POPUP 또는 기본값)
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
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            id="popup-mgmt"
            maxWidth="max-w-xl"
        >
            <div className="mgmt-popup-content">
                {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        등록된 항목이 없습니다.
                    </div>
                ) : (
                    <ul className="mgmt-popup-list">
                        {items.map((item, index) => (
                            <li key={index} className="mgmt-popup-item">
                                <div className="mgmt-popup-item-header">
                                    <span className="mgmt-popup-item-title">{item.title}</span>
                                    {item.link && (
                                        <button
                                            onClick={() => handleLinkClick(item)}
                                            className="mgmt-popup-link-btn"
                                            title={item.linkTarget === 'DIRECT' ? '새 탭에서 열기' : '팝업으로 열기'}
                                        >
                                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                                        </button>
                                    )}
                                </div>
                                {item.content && item.content !== item.title && (
                                    <p className="mgmt-popup-item-content">{item.content}</p>
                                )}
                                {(item.postFrom || item.postTo) && (
                                    <div className="mgmt-popup-item-period">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                        <span>
                                            {formatDate(item.postFrom)}
                                            {item.postFrom && item.postTo && ' ~ '}
                                            {formatDate(item.postTo)}
                                        </span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PopupContainer>
    );
};
