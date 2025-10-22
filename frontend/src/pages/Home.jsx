import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DiaryCard from '../components/DiaryCard';
import Pagination from '../components/Pagination';
import { diaryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // AuthContext의 loading이 완료될 때까지 대기
    if (authLoading) {
      return;
    }

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDiaries();
  }, [isAuthenticated, authLoading, navigate, currentPage]);

  const fetchDiaries = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await diaryAPI.getAll(skip, itemsPerPage, true);
      setDiaries(response.items);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('일기를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const profileImageUrl = user?.profile_image
    ? `http://localhost:8000${user.profile_image}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="relative mb-8">
          {/* 중앙 타이틀 */}
          <h1 className="text-4xl font-bold text-gray-800 text-center">당신의 하루를 공유해보세요</h1>

          {/* 우상단 프로필 사진 */}
          {isAuthenticated && user && (
            <button
              onClick={() => navigate('/profile')}
              className="absolute right-0 top-0 focus:outline-none"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold border-2 border-gray-300 hover:border-blue-500 transition-colors">
                  {user.nickname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>

        {diaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">아직 작성된 일기가 없습니다.</p>
            <Link
              to="/create"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              첫 번째 일기를 작성해보세요!
            </Link>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto space-y-4">
              {diaries.map((diary) => (
                <DiaryCard key={diary._id} diary={diary} />
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="max-w-4xl mx-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* 우하단 floating 버튼 (새 일기 작성) */}
      {isAuthenticated && (
        <Link
          to="/create"
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          title="새 일기 작성"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default Home;
