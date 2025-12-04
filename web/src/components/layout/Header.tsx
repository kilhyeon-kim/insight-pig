"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                        주간 보고서
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end max-w-2xl">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                className="w-24 sm:w-32 bg-transparent text-sm text-center focus:outline-none text-gray-900 dark:text-white"
                                dateFormat="yyyy.MM.dd"
                            />
                        </div>
                        <span className="text-gray-400">~</span>
                        <div className="relative">
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate ?? undefined}
                                className="w-24 sm:w-32 bg-transparent text-sm text-center focus:outline-none text-gray-900 dark:text-white"
                                dateFormat="yyyy.MM.dd"
                            />
                        </div>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-sm">
                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                        <span className="sr-only">조회</span>
                    </button>

                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};
