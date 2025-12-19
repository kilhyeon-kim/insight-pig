/**
 * API 서비스
 * Backend와 통신하는 공통 함수
 *
 * @env NEXT_PUBLIC_API_URL - Backend API URL (default: http://localhost:3001)
 * @env NEXT_PUBLIC_USE_MOCK - Mock 데이터 사용 여부 (default: true)
 */

import { MOCK_REPORT_LIST, MOCK_WEEKLY_DATA, MOCK_POPUP_DATA, MOCK_CHART_DATA } from './mockData';
import { ErrorCode, detectErrorCode, detectErrorCodeByStatus, getErrorMessage } from '@/err';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // 기본값: true (Mock 사용)

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  code: ErrorCode;
  statusCode?: number;

  constructor(code: ErrorCode, message?: string, statusCode?: number) {
    super(message || getErrorMessage(code));
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * 공통 fetch 함수
 * - USE_MOCK=true: Mock 데이터 반환
 * - USE_MOCK=false: 실제 Backend API 호출
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Mock Data Interception (개발 모드)
  if (USE_MOCK) {
    if (endpoint.startsWith('/api/weekly/list')) {
      return MOCK_REPORT_LIST as unknown as T;
    }
    if (endpoint.startsWith('/api/weekly/detail')) {
      return MOCK_WEEKLY_DATA as unknown as T;
    }
    if (endpoint.startsWith('/api/weekly/popup')) {
      return MOCK_POPUP_DATA as unknown as T;
    }
  }

  try {
    // 실제 API 호출
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    let result: any;
    try {
      result = await response.json();
    } catch {
      throw new ApiError(ErrorCode.ETC_PARSE_ERROR, undefined, response.status);
    }

    if (!response.ok) {
      const code = detectErrorCodeByStatus(response.status, result);
      throw new ApiError(code, result.message, response.status);
    }

    if (!result.success) {
      throw new ApiError(
        ErrorCode.SRV_INTERNAL_ERROR,
        result.message || getErrorMessage(ErrorCode.SRV_INTERNAL_ERROR)
      );
    }

    return result.data;
  } catch (error) {
    // 이미 ApiError면 그대로 throw
    if (error instanceof ApiError) {
      throw error;
    }
    // 네트워크/CORS/SSL 등 에러 감지
    const code = detectErrorCode(error);
    throw new ApiError(code);
  }
}

/**
 * 인증이 필요한 API 호출
 */
async function fetchApiWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!token) {
    throw new ApiError(ErrorCode.AUTH_LOGIN_REQUIRED);
  }

  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 주간 리포트 API
// ─────────────────────────────────────────────────────────────────────────────

export const weeklyApi = {
  /** 주간 리포트 목록 */
  getList: (from?: string, to?: string) => fetchApi('/api/weekly/list'),

  /** 주간 리포트 상세 */
  getDetail: (id: string) => fetchApi(`/api/weekly/detail/${id}`),

  /** 팝업 데이터 */
  getPopupData: (type: string, id: string) => fetchApi(`/api/weekly/popup/${type}/${id}`),

  /** 차트 데이터 */
  getChartData: (chartType: string) => {
    // Mock 모드: 로컬 데이터 사용
    if (USE_MOCK) {
      const data = MOCK_CHART_DATA[chartType];
      if (data) {
        return Promise.resolve(data);
      }
      return Promise.reject(new Error(`Unknown chart type: ${chartType}`));
    }
    // 실제 API 호출
    return fetchApi(`/api/weekly/chart/${chartType}`);
  },

  /** 전체 주간 데이터 (Legacy) */
  getAll: () => fetchApi('/api/weekly'),
};

export default {
  weekly: weeklyApi,
};
