# 일기 공유 페이지 프로젝트

## 프로젝트 개요
간단한 일기 공유 웹 애플리케이션

## 주요 기능
- 일기 작성
- 일기 목록 조회
- 일기 상세 보기
- 일기 수정/삭제

## 기술 스택
### 백엔드
- Python
- FastAPI
- MongoDB (로컬 서버)
- Motor (MongoDB 비동기 드라이버)

### 프론트엔드
- React
- JavaScript/TypeScript
- Tailwind CSS (스타일링)

## 데이터 모델
### Diary (일기)
- id: 고유 식별자
- title: 제목
- content: 내용
- author: 작성자
- createdAt: 작성일시
- updatedAt: 수정일시
- isPublic: 공개 여부

## API 설계
### 일기 관련 API
- `POST /api/diaries` - 일기 작성
- `GET /api/diaries` - 일기 목록 조회
- `GET /api/diaries/:id` - 일기 상세 조회
- `PUT /api/diaries/:id` - 일기 수정
- `DELETE /api/diaries/:id` - 일기 삭제

## 프로젝트 구조
```
/
├── backend/             # FastAPI 백엔드
│   ├── app/
│   │   ├── routes/      # API 라우트
│   │   ├── models/      # Pydantic 모델
│   │   ├── database.py  # MongoDB 연결 설정
│   │   └── main.py      # FastAPI 앱 진입점
│   └── requirements.txt
│
└── frontend/            # React 프론트엔드
    ├── src/
    │   ├── components/  # React 컴포넌트
    │   ├── pages/       # 페이지 컴포넌트
    │   ├── services/    # API 호출
    │   └── App.jsx
    ├── package.json
    └── tailwind.config.js
```

## 개발 단계
1. 프로젝트 초기 설정
2. 데이터베이스 설정
3. 백엔드 API 개발
4. 프론트엔드 UI 개발
5. 통합 테스트

## 추후 확장 기능
- 사용자 인증/로그인
- 댓글 기능
- 좋아요 기능
- 태그/카테고리
- 이미지 업로드
- 검색 기능
