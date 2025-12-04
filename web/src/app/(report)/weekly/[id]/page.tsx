"use client";

import React, { useState } from 'react';
import {
    MOCK_WEEKLY_DATA,
    MOCK_POPUP_DATA,
    MOCK_EXTRA_DATA,
    MOCK_MGMT_DATA,
    MOCK_SCHEDULE_POPUP_DATA,
    MOCK_PSY_TREND_DATA,
    MOCK_AUCTION_DATA,
    MOCK_WEATHER_DATA
} from '@/services/mockData';
import { WeeklyHeader } from '../_components/WeeklyHeader';
import { AlertCard } from '../_components/AlertCard';
import { LastWeekSection } from '../_components/LastWeekSection';
import { ThisWeekSection } from '../_components/ThisWeekSection';
import { ExtraSection } from '../_components/ExtraSection';
import { MgmtSection } from '../_components/MgmtSection';
import { TodoSection } from '../_components/TodoSection';

// Popups
import { AlertMdPopup } from '../_components/popups/AlertMdPopup';
import { ModonPopup } from '../_components/popups/ModonPopup';
import { MatingPopup } from '../_components/popups/MatingPopup';
import { FarrowingPopup } from '../_components/popups/FarrowingPopup';
import { WeaningPopup } from '../_components/popups/WeaningPopup';
import { AccidentPopup } from '../_components/popups/AccidentPopup';
import { CullingPopup } from '../_components/popups/CullingPopup';
import { ShipmentPopup } from '../_components/popups/ShipmentPopup';
import { ScheduleDetailPopup } from '../_components/popups/ScheduleDetailPopup';
import { PsyTrendPopup } from '../_components/popups/PsyTrendPopup';
import { AuctionPopup } from '../_components/popups/AuctionPopup';
import { WeatherPopup } from '../_components/popups/WeatherPopup';

interface WeeklyDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function WeeklyDetailPage({ params }: WeeklyDetailPageProps) {
    const data = MOCK_WEEKLY_DATA;
    const popupData = MOCK_POPUP_DATA;
    const [activePopup, setActivePopup] = useState<string | null>(null);

    const handlePopupOpen = (type: string) => {
        setActivePopup(type);
    };

    const handlePopupClose = () => {
        setActivePopup(null);
    };

    return (
        <div className="report-page-wrapper">
            {/* Header */}
            <WeeklyHeader data={data.header} />

            {/* Content */}
            <div className="p-2 sm:p-3 lg:p-4 space-y-6">
                {/* Alert Card */}
                {data.alertMd.count > 0 && (
                    <AlertCard data={data.alertMd} onClick={() => handlePopupOpen('alertMd')} />
                )}

                {/* Last Week Section */}
                <LastWeekSection data={data.lastWeek} onPopupOpen={handlePopupOpen} />

                {/* This Week Section */}
                <ThisWeekSection data={data.thisWeek} onPopupOpen={handlePopupOpen} />

                {/* Extra Section (부가 정보 아코디언) */}
                <ExtraSection data={MOCK_EXTRA_DATA} onPopupOpen={handlePopupOpen} />

                {/* Mgmt Section (현재 시기 관리 포인트) */}
                <MgmtSection data={MOCK_MGMT_DATA} />

                {/* Todo Section */}
                <TodoSection data={data.todo} />
            </div>

            {/* Popups */}
            <AlertMdPopup
                isOpen={activePopup === 'alertMd'}
                onClose={handlePopupClose}
                data={popupData.alertMd}
            />
            <ModonPopup
                isOpen={activePopup === 'modon'}
                onClose={handlePopupClose}
                data={popupData.modon}
            />
            <MatingPopup
                isOpen={activePopup === 'mating'}
                onClose={handlePopupClose}
                data={popupData.mating}
            />
            <FarrowingPopup
                isOpen={activePopup === 'farrowing'}
                onClose={handlePopupClose}
                data={popupData.farrowing}
            />
            <WeaningPopup
                isOpen={activePopup === 'weaning'}
                onClose={handlePopupClose}
                data={popupData.weaning}
            />
            <AccidentPopup
                isOpen={activePopup === 'accident'}
                onClose={handlePopupClose}
                data={popupData.accident}
            />
            <CullingPopup
                isOpen={activePopup === 'culling'}
                onClose={handlePopupClose}
                data={popupData.culling}
            />
            <ShipmentPopup
                isOpen={activePopup === 'shipment'}
                onClose={handlePopupClose}
                data={popupData.shipment}
            />

            {/* Schedule Detail Popups (금주 작업예정) */}
            <ScheduleDetailPopup
                isOpen={activePopup === 'scheduleGb'}
                onClose={handlePopupClose}
                data={MOCK_SCHEDULE_POPUP_DATA.scheduleGb}
                title="교배 예정"
                subtitle="금주 교배 대기돈 현황"
            />
            <ScheduleDetailPopup
                isOpen={activePopup === 'scheduleBm'}
                onClose={handlePopupClose}
                data={MOCK_SCHEDULE_POPUP_DATA.scheduleBm}
                title="분만 예정"
                subtitle="금주 분만 예정돈 현황"
            />
            <ScheduleDetailPopup
                isOpen={activePopup === 'scheduleEu'}
                onClose={handlePopupClose}
                data={MOCK_SCHEDULE_POPUP_DATA.scheduleEu}
                title="이유 예정"
                subtitle="금주 이유 예정돈 현황"
            />
            <ScheduleDetailPopup
                isOpen={activePopup === 'scheduleVaccine'}
                onClose={handlePopupClose}
                data={MOCK_SCHEDULE_POPUP_DATA.scheduleVaccine}
                title="모돈백신 예정"
                subtitle="금주 백신 예정돈 현황"
            />

            {/* Extra Section Popups (부가정보) */}
            <PsyTrendPopup
                isOpen={activePopup === 'psytrend'}
                onClose={handlePopupClose}
                data={MOCK_PSY_TREND_DATA}
            />
            <AuctionPopup
                isOpen={activePopup === 'auction'}
                onClose={handlePopupClose}
                data={MOCK_AUCTION_DATA}
            />
            <WeatherPopup
                isOpen={activePopup === 'weather'}
                onClose={handlePopupClose}
                data={MOCK_WEATHER_DATA}
            />
        </div>
    );
}
