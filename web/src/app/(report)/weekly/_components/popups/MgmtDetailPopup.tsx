import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PopupContainer } from './PopupContainer';
import { MgmtItem } from '@/types/weekly';

interface MgmtDetailPopupProps {
    isOpen: boolean;
    onClose: () => void;
    item: MgmtItem | null;
}

/**
 * 관리포인트 상세 팝업 (단일 아이템)
 */
export const MgmtDetailPopup: React.FC<MgmtDetailPopupProps> = ({
    isOpen,
    onClose,
    item
}) => {
    if (!item) return null;

    // 날짜 포맷팅 (YYYYMMDD -> YYYY.MM.DD)
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    // 링크 클릭 핸들러
    const handleLinkClick = () => {
        if (!item.link) return;

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
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            title={item.title}
            id="popup-mgmt-detail"
            maxWidth="max-w-xl"
        >
            <div className="mgmt-detail-content">
                {/* 상세 내용 */}
                {item.content && (
                    <div className="mgmt-detail-body">
                        {item.content}
                    </div>
                )}

                {/* 링크 버튼 */}
                {item.link && (
                    <button
                        onClick={handleLinkClick}
                        className="mgmt-detail-link-btn"
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        {item.linkTarget === 'DIRECT' ? '새 탭에서 열기' : '자세히 보기'}
                    </button>
                )}

                {/* 게시 기간 */}
                {(item.postFrom || item.postTo) && (
                    <div className="mgmt-detail-period">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>
                            게시기간: {formatDate(item.postFrom)}
                            {item.postFrom && item.postTo && ' ~ '}
                            {formatDate(item.postTo)}
                        </span>
                    </div>
                )}
            </div>
        </PopupContainer>
    );
};
