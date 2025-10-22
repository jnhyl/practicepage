import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentAPI } from '../services/api';
import Comment from './Comment';

const CommentSection = ({ diaryId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 정렬 상태 추가

  useEffect(() => {
    fetchComments();
  }, [diaryId, sortBy]); // sortBy가 변경될 때마다 댓글 다시 불러오기

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentAPI.getComments(diaryId, sortBy);
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
      setError('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (newComment.trim() === '') {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await commentAPI.create(diaryId, newComment);
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await commentAPI.update(commentId, content);
      await fetchComments();
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await commentAPI.delete(commentId);
      await fetchComments();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          댓글 {comments.length}개
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === 'newest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === 'likes'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            좋아요순
          </button>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="mb-6">
          <div className="flex items-start">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <button
                type="submit"
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                댓글 작성
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center text-gray-600">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-center py-4 text-gray-600">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-600">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
