import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 인증 오류 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 로그인
  login: async (credentials) => {
    const response = await api.post('/auth/login-json', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // 현재 사용자 정보
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 로그인 상태 확인
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // 현재 사용자 가져오기
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 업데이트된 사용자 정보를 로컬 스토리지에 저장
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  },

  // 회원정보 수정
  updateProfile: async (data) => {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },
};

// 일기 API
export const diaryAPI = {
  // 일기 목록 조회
  getAll: async (skip = 0, limit = 10, publicOnly = true) => {
    const response = await api.get('/diaries', {
      params: { skip, limit, public_only: publicOnly }
    });
    return response.data;
  },

  // 일기 상세 조회
  getById: async (id) => {
    const response = await api.get(`/diaries/${id}`);
    return response.data;
  },

  // 일기 생성
  create: async (diaryData) => {
    const response = await api.post('/diaries', diaryData);
    return response.data;
  },

  // 일기 수정
  update: async (id, diaryData) => {
    const response = await api.put(`/diaries/${id}`, diaryData);
    return response.data;
  },

  // 일기 삭제
  delete: async (id) => {
    const response = await api.delete(`/diaries/${id}`);
    return response.data;
  },
  // 현재 사용자 일기 조회
  getMine: async (skip = 0, limit = 10) => {
    const response = await api.get('/diaries/me', {
      params: { skip, limit }
    });
    return response.data;
  },
};

  // 댓글 API
export const commentAPI = {
  // 댓글 목록 조회
  getComments: async (diaryId, sortBy = 'newest') => {
    const response = await api.get(`/diaries/${diaryId}/comments`, {
      params: { sort_by: sortBy }
    });
    return response.data;
  },  // 댓글 생성
  create: async (diaryId, content) => {
    const response = await api.post(`/diaries/${diaryId}/comments`, { content });
    return response.data;
  },

  // 댓글 수정
  update: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  // 댓글 삭제
  delete: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
  // 현재 사용자 댓글 조회
  getMine: async () => {
    const response = await api.get('/comments/me');
    return response.data;
  },
};

// 좋아요 API
export const likeAPI = {
  // 일기 좋아요 토글
  toggleDiaryLike: async (diaryId) => {
    const response = await api.post(`/diaries/${diaryId}/like`);
    return response.data;
  },

  // 댓글 좋아요 토글
  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  },
};

export default api;
