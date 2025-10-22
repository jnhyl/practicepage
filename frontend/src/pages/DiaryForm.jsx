import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diaryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const DiaryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_public: true, // 항상 공개
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (isEditMode) {
      fetchDiary();
    }
  }, [id, isAuthenticated]);

  const fetchDiary = async () => {
    try {
      setLoading(true);
      const data = await diaryAPI.getById(id);
      setFormData({
        title: data.title,
        content: data.content,
        is_public: data.is_public,
      });
    } catch (err) {
      setError('일기를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await diaryAPI.update(id, formData);
        alert('일기가 수정되었습니다.');
      } else {
        await diaryAPI.create(formData);
        alert('일기가 작성되었습니다.');
      }
      navigate('/');
    } catch (err) {
      alert(isEditMode ? '일기 수정에 실패했습니다.' : '일기 작성에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isEditMode ? '일기 수정' : '새 일기 작성'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* 작성자 정보 표시 */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              작성자: <span className="font-medium text-gray-800">{user?.username}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="일기 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="일기 내용을 입력하세요"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate(-1)}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? '처리 중...' : (isEditMode ? '수정하기' : '작성하기')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiaryForm;
