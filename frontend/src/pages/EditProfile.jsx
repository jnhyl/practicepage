import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/Button';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    // 비밀번호 필드는 빈 문자열로 초기화
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 기본 유효성 검사
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // API 엔드포인트 호출
      const response = await authAPI.updateProfile({
        nickname: formData.nickname,
        email: formData.email,
        current_password: formData.currentPassword || undefined,
        new_password: formData.newPassword || undefined
      });

      setSuccess('회원정보가 성공적으로 수정되었습니다.');
      
      // 로컬 스토리지의 사용자 정보 업데이트
      const updatedUser = {
        ...user,
        nickname: formData.nickname,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 3초 후 프로필 페이지로 이동
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || '회원정보 수정에 실패했습니다.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">회원정보 수정</h1>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사용자명 (수정 불가) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                {user.username}
              </p>
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 비밀번호 변경 섹션 */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">비밀번호 변경</h2>
              
              {/* 현재 비밀번호 */}
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 새 비밀번호 */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={true}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                변경사항 저장
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;