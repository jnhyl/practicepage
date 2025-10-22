import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diaryAPI, likeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const DiaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchDiary();
  }, [id]);

  const fetchDiary = async () => {
    try {
      setLoading(true);
      const data = await diaryAPI.getById(id);
      setDiary(data);
      setLikesCount(data.likes_count || 0);
      setIsLiked(data.is_liked || false);
      setError(null);
    } catch (err) {
      setError('일기를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await likeAPI.toggleDiaryLike(id);
      setLikesCount(result.likes_count);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      try {
        await diaryAPI.delete(id);
        alert('일기가 삭제되었습니다.');
        navigate('/');
      } catch (err) {
        alert('일기 삭제에 실패했습니다.');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <Link to="/" className="text-blue-600 hover:text-blue-700 underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {diary.title}
            </h1>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {diary.author_profile_image ? (
                  <img
                    src={`http://localhost:8000${diary.author_profile_image}`}
                    alt={diary.author}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {diary.author?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-medium">작성자: {diary.author}</span>
              </div>
              <span>작성일: {formatDate(diary.created_at)}</span>
            </div>
            {diary.created_at !== diary.updated_at && (
              <div className="text-sm text-gray-500 mt-1">
                수정일: {formatDate(diary.updated_at)}
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {diary.content}
            </p>
          </div>

          {/* 좋아요 버튼 */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg
                className="w-6 h-6"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-medium">{likesCount}</span>
            </button>
          </div>

          <div className="flex gap-4 border-t pt-6">
            <Link
              to="/"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              목록으로
            </Link>
            {/* 본인 글일 때만 수정/삭제 버튼 표시 */}
            {user && (diary.user_id === user.id || diary.user_id === user._id) && (
              <>
                <Link
                  to={`/edit/${id}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </>
            )}
          </div>

          {/* 댓글 섹션 */}
          <CommentSection diaryId={id} />
        </div>
      </div>
    </div>
  );
};

export default DiaryDetail;
