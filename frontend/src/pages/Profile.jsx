import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/Button';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      await authAPI.uploadProfileImage(file);
      // 페이지 새로고침하여 업데이트된 프로필 이미지 표시
      window.location.reload();
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      setUploadError('프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  const profileImageUrl = user.profile_image
    ? `http://localhost:8000${user.profile_image}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 상단 네비게이션 */}
        <div className="flex justify-end gap-3 mb-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/my/diaries')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8m-2 12h-3a2 2 0 01-2-2v-3" />
            </svg>
            내 게시글
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/my/comments')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            내 댓글
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">프로필</h1>

          {/* 프로필 이미지 섹션 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필 이미지"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                  {user.nickname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <label className="cursor-pointer inline-block">
              <Button
                variant="primary"
                size="md"
                disabled={uploading}
                as="span"
              >
                {uploading ? '업로드 중...' : '프로필 사진 변경'}
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}

            {/* 회원정보 수정 버튼 */}
            <div className="mt-4 w-full">
              <Button
                variant="secondary"
                size="lg"
                fullWidth={true}
                onClick={() => navigate('/edit-profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                회원정보 수정
              </Button>
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                {user.username}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                {user.nickname || user.username}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                {user.email}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈으로 돌아가기
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
