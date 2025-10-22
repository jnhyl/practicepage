import React from 'react';
import Button from './Button';

/**
 * 페이지네이션 컴포넌트
 *
 * @param {number} currentPage - 현재 페이지 (1부터 시작)
 * @param {number} totalPages - 전체 페이지 수
 * @param {function} onPageChange - 페이지 변경 핸들러
 * @param {number} maxVisible - 표시할 최대 페이지 버튼 수 (기본: 5)
 */
const Pagination = ({ currentPage, totalPages, onPageChange, maxVisible = 5 }) => {
  if (totalPages <= 1) return null;

  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // 끝에서 시작할 때 조정
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {/* 이전 페이지 */}
      <Button
        variant="secondary"
        size="md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {/* 첫 페이지 */}
      {pageNumbers[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? 'primary' : 'ghost'}
            size="md"
            onClick={() => onPageChange(1)}
            className="min-w-[40px]"
          >
            1
          </Button>
          {pageNumbers[0] > 2 && (
            <span className="text-gray-400 px-2">...</span>
          )}
        </>
      )}

      {/* 페이지 번호들 */}
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'ghost'}
          size="md"
          onClick={() => onPageChange(page)}
          className="min-w-[40px]"
        >
          {page}
        </Button>
      ))}

      {/* 마지막 페이지 */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="text-gray-400 px-2">...</span>
          )}
          <Button
            variant={currentPage === totalPages ? 'primary' : 'ghost'}
            size="md"
            onClick={() => onPageChange(totalPages)}
            className="min-w-[40px]"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* 다음 페이지 */}
      <Button
        variant="secondary"
        size="md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

export default Pagination;
