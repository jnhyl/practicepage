import React from 'react';

/**
 * 공통 버튼 컴포넌트
 *
 * variant: 버튼 스타일
 * - primary: 주요 액션 (파랑)
 * - secondary: 보조 액션 (회색)
 * - danger: 삭제/위험 (빨강)
 * - success: 성공/확인 (초록)
 * - ghost: 테두리만 있는 버튼
 *
 * size: 버튼 크기
 * - sm: 작음 (px-3 py-1.5)
 * - md: 중간 (px-4 py-2) - 기본값
 * - lg: 큼 (px-6 py-3)
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  // 기본 스타일
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  // 크기별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-base',
  };

  // variant별 스타일
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-400',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
