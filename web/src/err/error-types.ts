/**
 * 에러 타입 정의 (백엔드와 동일)
 */
export enum ErrorType {
    /** 데이터베이스 관련 에러 */
    DB = 'DB',

    /** 백엔드 서버 내부 에러 */
    BACKEND = 'BACKEND',

    /** 입력 검증 에러 */
    VALIDATION = 'VALIDATION',

    /** 리소스를 찾을 수 없음 */
    NOT_FOUND = 'NOT_FOUND',

    /** 일반 API 에러 */
    API = 'API',

    /** 인증 에러 */
    AUTH = 'AUTH',

    /** 권한 에러 */
    FORBIDDEN = 'FORBIDDEN',

    /** 프론트엔드 에러 */
    FRONTEND = 'FRONTEND',

    /** 네트워크 에러 */
    NETWORK = 'NETWORK',

    /** 알 수 없는 에러 */
    UNKNOWN = 'UNKNOWN',
}

/**
 * API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
    success: false;
    errorType: ErrorType;
    statusCode: number;
    message: string;
    timestamp: string;
    path: string;
    details?: any;
}

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
    type: ErrorType;
    message: string;
    details?: any;
}
