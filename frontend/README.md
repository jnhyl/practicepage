# 일기 공유 - Frontend

React와 Tailwind CSS를 사용한 일기 공유 애플리케이션 프론트엔드

## 기술 스택
- React 18
- Vite (빌드 도구)
- React Router v6 (라우팅)
- Axios (HTTP 클라이언트)
- Tailwind CSS (스타일링)

## 설치 방법

### 1. 의존성 설치
```bash
npm install
```

## 실행 방법

### 개발 서버 실행
```bash
npm run dev
```

개발 서버가 실행되면 http://localhost:5173 에서 접근 가능합니다.

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 미리보기
```bash
npm run preview
```

## 프로젝트 구조
```
frontend/
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   └── DiaryCard.jsx   # 일기 카드 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.jsx        # 메인 페이지 (일기 목록)
│   │   ├── DiaryDetail.jsx # 일기 상세 페이지
│   │   └── DiaryForm.jsx   # 일기 작성/수정 폼
│   ├── services/           # API 서비스
│   │   └── api.js          # API 호출 함수
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── main.jsx            # 진입점
│   └── index.css           # 전역 스타일
├── package.json
└── tailwind.config.js      # Tailwind 설정
```

## 주요 기능
- 일기 목록 조회
- 일기 상세 보기
- 일기 작성
- 일기 수정
- 일기 삭제

## 라우트
- `/` - 홈 (일기 목록)
- `/diary/:id` - 일기 상세 보기
- `/create` - 새 일기 작성
- `/edit/:id` - 일기 수정

## API 연동
백엔드 API 서버가 http://localhost:8000 에서 실행 중이어야 합니다.

API 엔드포인트 설정은 `src/services/api.js` 파일에서 수정할 수 있습니다.
