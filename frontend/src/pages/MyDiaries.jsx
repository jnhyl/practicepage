import React, { useEffect, useState } from 'react';
import { diaryAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Pagination from '../components/Pagination';

const MyDiaries = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyDiaries();
  }, [currentPage]);

  const fetchMyDiaries = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await diaryAPI.getMine(skip, itemsPerPage);
      setDiaries(response.items);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (err) {
      console.error(err);
      alert('내 일기 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await diaryAPI.delete(id);
      alert('일기가 삭제되었습니다.');

      // 현재 페이지에 항목이 1개만 있고 첫 페이지가 아니면 이전 페이지로
      if (diaries.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // 현재 페이지 새로고침
        fetchMyDiaries();
      }
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
          <h1 className="text-3xl font-bold text-gray-800">내가 쓴 일기</h1>
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

        {/* 일기 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {diaries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-4">작성한 일기가 없습니다.</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/create')}
              >
                첫 일기 작성하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {diaries.map((d) => (
                <div key={d._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/diary/${d._id}`)}>
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-2">
                        {d.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(d.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {d.likes_count || 0}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {d.is_public ? '공개' : '비공개'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleEdit(d._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        수정
                      </Button>
                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => handleDelete(d._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {diaries.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDiaries;
