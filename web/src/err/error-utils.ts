import { ErrorType, ErrorInfo, ApiErrorResponse } from './error-types';
import { ErrorMessages } from './error-messages';

/**
 * 에러 메시지 포맷팅
 */
export function formatErrorMessage(errorType: ErrorType, message?: string): string {
    const errorConfig = ErrorMessages[errorType] || ErrorMessages.FRONTEND;
    const title = errorConfig.title;
    const defaultMsg = errorConfig.default;

    return `[${title}] ${message || defaultMsg}`;
}

/**
 * API 에러 응답 파싱
 */
export function parseApiError(response: any): ErrorInfo {
    const errorType = (response.errorType as ErrorType) || ErrorType.UNKNOWN;
    const message = response.message || ErrorMessages[errorType]?.default || '알 수 없는 오류가 발생했습니다.';

    return {
        type: errorType,
        message: formatErrorMessage(errorType, message),
        details: response,
    };
}

/**
 * Fetch 에러 파싱
 */
export function parseFetchError(error: unknown): ErrorInfo {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
            type: ErrorType.NETWORK,
            message: formatErrorMessage(ErrorType.NETWORK),
        };
    } else if (error instanceof SyntaxError) {
        return {
            type: ErrorType.FRONTEND,
            message: formatErrorMessage(ErrorType.FRONTEND, 'API 응답 파싱 중 오류가 발생했습니다.'),
        };
    } else {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        return {
            type: ErrorType.FRONTEND,
            message: formatErrorMessage(ErrorType.FRONTEND, errorMessage),
        };
    }
}

/**
 * HTTP 상태 코드 기반 에러 타입 추론
 */
export function getErrorTypeByStatus(status: number): ErrorType {
    if (status >= 500) {
        return ErrorType.BACKEND;
    } else if (status === 404) {
        return ErrorType.NOT_FOUND;
    } else if (status === 401) {
        return ErrorType.AUTH;
    } else if (status === 403) {
        return ErrorType.FORBIDDEN;
    } else if (status === 400 || status === 422) {
        return ErrorType.VALIDATION;
    }
    return ErrorType.API;
}
