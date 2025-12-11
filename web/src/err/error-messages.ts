/**
 * 에러 메시지 상수
 */
export const ErrorMessages = {
    // 데이터베이스 에러
    DB: {
        title: 'DB 에러',
        default: '데이터베이스 오류가 발생했습니다.\n관리자에게 문의하세요.',
    },

    // 백엔드 에러
    BACKEND: {
        title: '백엔드 에러',
        default: '서버 오류가 발생했습니다.\n관리자에게 문의하세요.',
    },

    // 검증 에러
    VALIDATION: {
        title: '입력 검증 에러',
        default: '입력값을 확인하세요.',
    },

    // 조회 에러
    NOT_FOUND: {
        title: '조회 에러',
        default: '요청한 데이터를 찾을 수 없습니다.',
    },

    // API 에러
    API: {
        title: 'API 에러',
        default: '요청 처리 중 오류가 발생했습니다.',
    },

    // 인증 에러
    AUTH: {
        title: '인증 에러',
        default: '인증에 실패했습니다.\n다시 로그인해주세요.',
    },

    // 권한 에러
    FORBIDDEN: {
        title: '권한 에러',
        default: '접근 권한이 없습니다.',
    },

    // 프론트엔드 에러
    FRONTEND: {
        title: '프론트엔드 에러',
        default: '예상치 못한 오류가 발생했습니다.',
    },

    // 네트워크 에러
    NETWORK: {
        title: '네트워크 에러',
        default: '네트워크 연결에 실패했습니다.\n서버가 실행 중인지 확인하세요.',
    },

    // 서버 에러
    SERVER: {
        title: '서버 에러',
        default: '서버 오류가 발생했습니다.',
    },

    // 요청 에러
    REQUEST: {
        title: '요청 에러',
        default: '요청 처리 중 오류가 발생했습니다.',
    },
} as const;
