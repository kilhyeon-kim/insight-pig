import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "피그플랜 - 양돈농장 관리 시스템",
  description: "양돈농장 관리 및 리포트 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 초기 테마 설정 스크립트 - FOUC 방지 및 기본 light 모드 적용
  // + bfcache 복원 시 페이지 새로고침 (RSC 상태 불일치 방지)
  const themeInitScript = `
    (function() {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        if (!theme) localStorage.setItem('theme', 'light');
      }
    })();

    // bfcache(Back-Forward Cache) 복원 시 페이지 새로고침
    // Next.js RSC 상태 불일치로 인한 네비게이션 오류 방지
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
  `;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
