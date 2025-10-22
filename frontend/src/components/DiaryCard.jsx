import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { likeAPI } from '../services/api';

const DiaryCard = ({ diary, onLikeUpdate }) => {
  const [localLikesCount, setLocalLikesCount] = useState(diary.likes_count || 0);
  const [localIsLiked, setLocalIsLiked] = useState(diary.is_liked || false);

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

  const handleLike = async (e) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    try {
      const result = await likeAPI.toggleDiaryLike(diary._id);
      setLocalLikesCount(result.likes_count);
      setLocalIsLiked(result.liked);
      if (onLikeUpdate) {
        onLikeUpdate(diary._id, result.likes_count, result.liked);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <Link to={`/diary/${diary._id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 mb-3">
          {diary.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 프로필 사진 */}
            {diary.author_profile_image ? (
              <img
                src={`http://localhost:8000${diary.author_profile_image}`}
                alt={diary.author}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {(diary.author || '익명')[0]?.toUpperCase()}
              </div>
            )}
            {/* 닉네임 */}
            <span className="text-sm font-medium text-gray-800">
              {diary.author || '익명'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                localIsLiked ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500 transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill={localIsLiked ? 'currentColor' : 'none'}
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
              <span className="text-sm">{localLikesCount}</span>
            </button>

            {/* 날짜 */}
            <span className="text-sm text-gray-500">
              {formatDate(diary.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DiaryCard;
