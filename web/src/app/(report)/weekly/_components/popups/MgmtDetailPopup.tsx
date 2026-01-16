import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faCalendarAlt, faPlayCircle, faTimes, faDownload, faFile } from '@fortawesome/free-solid-svg-icons';
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
    const [showVideo, setShowVideo] = useState(false);

    if (!item) return null;

    // 날짜 포맷팅 (YYYYMMDD -> YYYY.MM.DD)
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    // 링크 클릭 핸들러 - 항상 새 탭에서 열기
    const handleLinkClick = () => {
        if (!item.link) return;
        window.open(item.link, '_blank', 'noopener,noreferrer');
    };

    // 동영상 보기 클릭 핸들러
    const handleVideoClick = () => {
        setShowVideo(true);
    };

    // 동영상 닫기 핸들러
    const handleVideoClose = () => {
        setShowVideo(false);
    };

    // 팝업 닫힐 때 동영상도 닫기
    const handlePopupClose = () => {
        setShowVideo(false);
        onClose();
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={handlePopupClose}
            title={item.title}
            id="popup-mgmt-detail"
            maxWidth="max-w-xl"
        >
            <div className="mgmt-detail-content">
                {/* 상세 내용 */}
                {item.content && (
                    <div className="mgmt-detail-body">
                        {item.contentType === 'HTML' ? (
                            <div
                                className="mgmt-html-content"
                                dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                        ) : (
                            <div className="mgmt-text-content whitespace-pre-wrap">
                                {item.content}
                            </div>
                        )}
                    </div>
                )}

                {/* 동영상 플레이어 */}
                {showVideo && item.videoUrl && (
                    <div className="mgmt-video-container">
                        <div className="mgmt-video-header">
                            <span>동영상</span>
                            <button
                                onClick={handleVideoClose}
                                className="mgmt-video-close"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <video
                            controls
                            autoPlay
                            className="mgmt-video-player"
                            src={item.videoUrl}
                        >
                            브라우저가 동영상을 지원하지 않습니다.
                        </video>
                    </div>
                )}

                {/* 동영상 보기 버튼 */}
                {item.videoUrl && !showVideo && (
                    <button
                        onClick={handleVideoClick}
                        className="mgmt-detail-video-btn"
                    >
                        <FontAwesomeIcon icon={faPlayCircle} />
                        동영상 보기
                    </button>
                )}

                {/* 링크 버튼 */}
                {item.link && (
                    <button
                        onClick={handleLinkClick}
                        className="mgmt-detail-link-btn"
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        자세히 보기
                    </button>
                )}

                {/* 첨부파일 목록 */}
                {item.attachFiles && item.attachFiles.length > 0 && (
                    <div className="mgmt-attach-files">
                        <div className="mgmt-attach-header">
                            <FontAwesomeIcon icon={faFile} />
                            <span>첨부파일 ({item.attachFiles.length})</span>
                        </div>
                        <ul className="mgmt-attach-list">
                            {item.attachFiles.map((file) => (
                                <li key={file.fileSeq} className="mgmt-attach-item">
                                    <a
                                        href={file.fileUrl}
                                        download={file.fileOrgnlNm}
                                        className="mgmt-attach-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="mgmt-attach-name">{file.fileOrgnlNm}</span>
                                        <span className="mgmt-attach-size">
                                            {file.fileSize > 1024 * 1024
                                                ? `${(file.fileSize / 1024 / 1024).toFixed(1)}MB`
                                                : `${Math.round(file.fileSize / 1024)}KB`}
                                        </span>
                                        <FontAwesomeIcon icon={faDownload} className="mgmt-attach-icon" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
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
