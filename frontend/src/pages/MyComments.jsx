import React, { useEffect, useState } from 'react';
import { commentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const MyComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyComments();
  }, []);

  const fetchMyComments = async () => {
    try {
      setLoading(true);
      const data = await commentAPI.getMine();
      setComments(data);
    } catch (err) {
      console.error(err);
      alert('내 댓글 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, content) => {
    const newContent = prompt('댓글을 수정하세요', content);
    if (newContent == null) return;
    try {
      await commentAPI.update(id, newContent);
      setComments((s) => s.map(c => c._id === id ? { ...c, content: newContent } : c));
    } catch (err) {
      console.error(err);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await commentAPI.delete(id);
      setComments((s) => s.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">내가 쓴 댓글</h1>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              프로필
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈
            </Button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-4">작성한 댓글이 없습니다.</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/')}
              >
                게시글 보러가기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div
                      onClick={() => navigate(`/diary/${c.diary_id}`)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8m-2 12h-3a2 2 0 01-2-2v-3" />
                      </svg>
                      <span className="group-hover:underline font-medium">해당 게시글로 이동</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="mb-4 p-4 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100"
                    onClick={() => navigate(`/diary/${c.diary_id}`)}
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleEdit(c._id, c.content)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => handleDelete(c._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComments;
