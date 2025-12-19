"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  memberId: string;
  name: string;
  farmNo: number;
  farmNm: string;
  memberType: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (memberId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAccessToken: () => string | null;
  // 테스트용 farmNo 오버라이드 기능
  testFarmNo: number | null;
  setTestFarmNo: (farmNo: number | null) => void;
  // 실제 사용할 farmNo (테스트용이 있으면 테스트용, 없으면 세션의 farmNo)
  activeFarmNo: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testFarmNo, setTestFarmNoState] = useState<number | null>(null);
  const router = useRouter();

  // localStorage에서 토큰 가져오기
  const getAccessToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  // 토큰 저장
  const setAccessToken = (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };

  // 테스트 farmNo 설정 (localStorage에 저장)
  const setTestFarmNo = useCallback((farmNo: number | null) => {
    setTestFarmNoState(farmNo);
    if (typeof window === 'undefined') return;
    if (farmNo) {
      localStorage.setItem('testFarmNo', String(farmNo));
    } else {
      localStorage.removeItem('testFarmNo');
    }
  }, []);

  // 실제 사용할 farmNo
  const activeFarmNo = testFarmNo ?? user?.farmNo ?? null;

  // 사용자 정보 조회 (토큰 검증)
  const fetchUserInfo = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data as User;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }, []);

  // 초기화: 저장된 토큰으로 사용자 정보 복원
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      // 저장된 테스트 farmNo 복원
      const savedTestFarmNo = localStorage.getItem('testFarmNo');
      if (savedTestFarmNo) {
        setTestFarmNoState(Number(savedTestFarmNo));
      }

      if (token) {
        const userData = await fetchUserInfo(token);
        if (userData) {
          setUser(userData);
        } else {
          // 토큰이 유효하지 않으면 삭제
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [getAccessToken, fetchUserInfo]);

  // 로그인
  const login = useCallback(async (memberId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || '로그인에 실패했습니다.',
        };
      }

      if (data.success && data.data) {
        const { accessToken, user: userData } = data.data;
        setAccessToken(accessToken);
        setUser(userData);
        return { success: true };
      }

      return {
        success: false,
        error: '로그인 응답 형식이 올바르지 않습니다.',
      };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `서버 연결에 실패했습니다. (${errorMessage})`,
      };
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setTestFarmNo(null);
    router.push('/login');
  }, [router, setTestFarmNo]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getAccessToken,
    testFarmNo,
    setTestFarmNo,
    activeFarmNo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증이 필요한 페이지에서 사용할 HOC 또는 훅
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};
