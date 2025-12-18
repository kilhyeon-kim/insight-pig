"use client";

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pb-20">
        {children}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
