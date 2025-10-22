import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { likeAPI } from '../services/api';

const Comment = ({ comment, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiked, setIsLiked] = useState(comment.is_liked || false);

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

  const handleUpdate = async () => {
    if (editContent.trim() === '') {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    await onUpdate(comment.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleLike = async () => {
    try {
      const result = await likeAPI.toggleCommentLike(comment.id);
      setLikesCount(result.likes_count);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const isAuthor = user && (user.id === comment.user_id || user._id === comment.user_id);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {/* 프로필 아바타 */}
        {comment.author_profile_image ? (
          <img
            src={`http://localhost:8000${comment.author_profile_image}`}
            alt={comment.author}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {comment.author[0]?.toUpperCase()}
          </div>
        )}
        {/* 작성자와 날짜 */}
        <div className="flex-1">
          <span className="font-medium text-gray-800">{comment.author}</span>
          <span className="text-sm text-gray-500 ml-2">{formatDate(comment.created_at)}</span>
        </div>
        {/* 수정/삭제 버튼 (본인만) */}
        {isAuthor && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              수정
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 댓글 내용 */}
      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          {/* 좋아요 버튼 */}
          <div className="mt-2">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500 transition-colors ${
                !user ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className="w-4 h-4"
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
              <span>{likesCount}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Comment;
