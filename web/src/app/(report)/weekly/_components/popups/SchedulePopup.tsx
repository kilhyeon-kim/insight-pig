import React from 'react';
import { SchedulePopupData } from '@/types/weekly';
import { PopupContainer } from './PopupContainer';

interface SchedulePopupProps {
    isOpen: boolean;
    onClose: () => void;
    data: SchedulePopupData;
    title: string;
}

export const SchedulePopup: React.FC<SchedulePopupProps> = ({ isOpen, onClose, data, title }) => {
    return (
        <PopupContainer isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{data.date} 기준</div>
                <div className="space-y-2">
                    {data.events.length > 0 ? (
                        data.events.map((event, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{event.count}두</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            예정된 작업이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </PopupContainer>
    );
};
