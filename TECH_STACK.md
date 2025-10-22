# 일기 공유 플랫폼 - 기술 스택 & 아키텍처

## 📌 프로젝트 개요
사용자가 일기를 작성하고 공유할 수 있는 웹 애플리케이션. 공개/비공개 일기 작성, 댓글, 좋아요 기능을 제공하며, JWT 기반 인증 시스템을 통한 사용자 관리를 지원합니다.

---

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite + React Router)                     │   │
│  │  - 컴포넌트 기반 UI                                    │   │
│  │  - Context API (인증 상태 관리)                        │   │
│  │  - Axios (HTTP 클라이언트)                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FastAPI Backend                                      │   │
│  │  - RESTful API Endpoints                             │   │
│  │  - JWT 인증/인가 미들웨어                              │   │
│  │  - Pydantic 데이터 검증                               │   │
│  │  - 비동기 요청 처리                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Motor (Async Driver)
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MongoDB (NoSQL)                                      │   │
│  │  - users (사용자)                                      │   │
│  │  - diaries (일기)                                     │   │
│  │  - comments (댓글)                                    │   │
│  │  - likes (좋아요)                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 기술 스택

### **Frontend**

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | React | 19.1.1 | UI 라이브러리 |
| **빌드 도구** | Vite | 7.1.7 | 개발 서버 & 빌드 도구 |
| **라우팅** | React Router DOM | 7.9.4 | 클라이언트 사이드 라우팅 |
| **HTTP 클라이언트** | Axios | 1.12.2 | API 통신 |
| **스타일링** | Tailwind CSS | 3.4.18 | 유틸리티 우선 CSS 프레임워크 |
| **CSS 전처리** | PostCSS | 8.5.6 | CSS 변환 도구 |
| **CSS 전처리** | Autoprefixer | 10.4.21 | 벤더 프리픽스 자동 추가 |
| **린터** | ESLint | 9.36.0 | 코드 품질 검사 |

**프론트엔드 디렉토리 구조:**
```
frontend/
├── src/
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.jsx           # 통합 버튼 컴포넌트
│   │   ├── DiaryCard.jsx        # 일기 카드
│   │   ├── Comment.jsx          # 댓글 아이템
│   │   ├── CommentSection.jsx   # 댓글 섹션
│   │   └── Pagination.jsx       # 페이지네이션
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── Home.jsx             # 메인 (공개 일기 목록)
│   │   ├── Login.jsx            # 로그인
│   │   ├── Register.jsx         # 회원가입
│   │   ├── Profile.jsx          # 프로필
│   │   ├── EditProfile.jsx      # 프로필 수정
│   │   ├── MyDiaries.jsx        # 내 일기 목록
│   │   ├── MyComments.jsx       # 내 댓글 목록
│   │   ├── DiaryForm.jsx        # 일기 작성/수정 폼
│   │   └── DiaryDetail.jsx      # 일기 상세
│   ├── context/         # React Context
│   │   └── AuthContext.jsx      # 인증 상태 관리
│   ├── services/        # API 서비스
│   │   └── api.js               # Axios 인스턴스 & API 함수
│   ├── App.jsx          # 루트 컴포넌트
│   └── main.jsx         # 진입점
├── public/              # 정적 파일
├── index.html           # HTML 템플릿
├── vite.config.js       # Vite 설정
├── tailwind.config.js   # Tailwind 설정
└── package.json
```

---

### **Backend**

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | FastAPI | 0.109.0 | 비동기 웹 프레임워크 |
| **ASGI 서버** | Uvicorn | 0.27.0 | ASGI 웹 서버 |
| **데이터베이스 드라이버** | Motor | 3.3.2 | MongoDB 비동기 드라이버 |
| **데이터베이스 클라이언트** | PyMongo | 4.6.1 | MongoDB 파이썬 클라이언트 |
| **데이터 검증** | Pydantic | 2.5.3 | 데이터 모델링 & 검증 |
| **JWT 인증** | python-jose[cryptography] | 3.3.0 | JWT 토큰 생성/검증 |
| **비밀번호 해싱** | passlib[bcrypt] | 1.7.4 | 비밀번호 암호화 |
| **환경변수** | python-dotenv | 1.0.0 | 환경변수 로드 |
| **파일 업로드** | python-multipart | 0.0.6 | 멀티파트 폼 데이터 처리 |

**백엔드 디렉토리 구조:**
```
backend/
├── app/
│   ├── models/          # Pydantic 데이터 모델
│   │   ├── user.py              # 사용자 모델
│   │   ├── diary.py             # 일기 모델
│   │   ├── comment.py           # 댓글 모델
│   │   └── like.py              # 좋아요 모델
│   ├── routes/          # API 라우터
│   │   ├── auth.py              # 인증 API
│   │   ├── diary.py             # 일기 API
│   │   ├── comment.py           # 댓글 API
│   │   └── like.py              # 좋아요 API
│   ├── auth.py          # JWT 인증 로직
│   ├── database.py      # MongoDB 연결 관리
│   └── main.py          # FastAPI 앱 진입점
├── uploads/             # 업로드 파일 저장소
│   └── profile_images/
├── venv/                # 가상 환경
├── requirements.txt     # 의존성 패키지
└── .env.example         # 환경변수 예제
```

---

### **Database**

| 기술 | 버전 | 용도 |
|------|------|------|
| **MongoDB** | 로컬 설치 | NoSQL 문서 기반 데이터베이스 |

**데이터베이스 스키마:**

```javascript
// users 컬렉션
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  nickname: String,
  hashed_password: String,
  profile_image: String (nullable),
  created_at: ISODate
}

// diaries 컬렉션
{
  _id: ObjectId,
  title: String,
  content: String,
  author: String,              // 닉네임 또는 사용자명
  user_id: ObjectId,           // users._id 참조
  is_public: Boolean,
  created_at: ISODate,
  updated_at: ISODate
}

// comments 컬렉션
{
  _id: ObjectId,
  diary_id: ObjectId,          // diaries._id 참조
  user_id: ObjectId,           // users._id 참조
  author: String,              // 닉네임 또는 사용자명
  content: String,
  created_at: ISODate,
  updated_at: ISODate
}

// likes 컬렉션
{
  _id: ObjectId,
  target_type: String,         // "diary" | "comment"
  target_id: ObjectId,         // diaries._id 또는 comments._id
  user_id: ObjectId,           // users._id 참조
  created_at: ISODate
}
```

---

## 🔐 인증 & 보안

### **JWT 기반 인증**
- **토큰 발급**: 로그인/회원가입 시 JWT Access Token 발급
- **토큰 저장**: 프론트엔드 LocalStorage에 저장
- **인증 방식**: Bearer Token (Authorization 헤더)
- **자동 만료**: 토큰 만료 시 401 에러로 자동 로그아웃
- **비밀번호 해싱**: bcrypt 알고리즘 사용

### **API 보안**
- **CORS 설정**: FastAPI의 CORSMiddleware로 허용된 origin 제한
- **인증 보호**: Protected 엔드포인트는 `Depends(get_current_user)` 사용
- **선택적 인증**: 일부 엔드포인트는 `get_current_user_optional` 사용
- **권한 검증**: 본인 리소스만 수정/삭제 가능 (user_id 비교)
- **입력 검증**: Pydantic 모델로 요청 데이터 자동 검증

---

## 🔄 API 설계 패턴

### **RESTful API**
```
인증 관련:
POST   /api/auth/register          # 회원가입
POST   /api/auth/login-json        # 로그인
GET    /api/auth/me                # 현재 사용자 정보
POST   /api/auth/upload-profile-image  # 프로필 이미지 업로드
PUT    /api/auth/update-profile    # 회원정보 수정

일기 관련:
POST   /api/diaries                # 일기 작성
GET    /api/diaries                # 일기 목록 (공개, 페이지네이션)
GET    /api/diaries/me             # 내 일기 목록 (공개+비공개, 페이지네이션)
GET    /api/diaries/{id}           # 일기 상세
PUT    /api/diaries/{id}           # 일기 수정 (본인만)
DELETE /api/diaries/{id}           # 일기 삭제 (본인만)

댓글 관련:
GET    /api/diaries/{id}/comments  # 특정 일기의 댓글 목록
POST   /api/diaries/{id}/comments  # 댓글 작성
GET    /api/comments/me            # 내가 작성한 댓글 목록
PUT    /api/comments/{id}          # 댓글 수정 (본인만)
DELETE /api/comments/{id}          # 댓글 삭제 (본인만)

좋아요 관련:
POST   /api/diaries/{id}/like      # 일기 좋아요 토글
POST   /api/comments/{id}/like     # 댓글 좋아요 토글
```

### **페이지네이션**
- **방식**: Skip/Limit 패턴
- **파라미터**: `skip`, `limit`
- **응답 형식**: `{items: [], total: number, skip: number, limit: number}`
- **적용 페이지**: 홈 (공개 일기), 내 일기, 댓글 목록

---

## 🎨 UI/UX 디자인 시스템

### **컴포넌트 재사용성**
- **Button 컴포넌트**: 5가지 variant (primary, secondary, danger, success, ghost), 3가지 size (sm, md, lg)
- **Pagination 컴포넌트**: 동적 페이지 번호 표시, 첫/마지막 페이지 바로가기
- **DiaryCard 컴포넌트**: 일기 미리보기 카드
- **Comment 컴포넌트**: 댓글 아이템 (수정/삭제 기능 포함)

### **스타일링 전략**
- **Utility-First CSS**: Tailwind CSS 사용
- **반응형 디자인**: 모바일 우선 설계
- **일관된 색상**: primary (blue-600), secondary (gray-200), danger (red-600), success (green-600)
- **인터랙션**: hover, focus, disabled 상태 스타일 적용

---

## 📦 상태 관리

### **클라이언트 상태 관리**
- **전역 상태**: React Context API (`AuthContext`)
  - 사용자 인증 상태 (user, isAuthenticated, loading)
  - 자동 로그인 (페이지 로드 시 토큰 검증)
  - 로그인/로그아웃 함수
- **로컬 상태**: useState (컴포넌트별 UI 상태)
- **영구 저장소**: LocalStorage (access_token, user)

### **서버 상태 관리**
- **데이터 페칭**: Axios 기반 API 호출
- **에러 처리**: try-catch + alert/console.error
- **인터셉터**:
  - Request: 자동 토큰 추가
  - Response: 401 에러 시 자동 로그아웃

---

## ⚡ 성능 최적화

### **Frontend**
- **Vite 사용**: 빠른 HMR (Hot Module Replacement)
- **코드 스플리팅**: React Router의 lazy loading (향후 적용 가능)
- **Tailwind CSS**: Production 빌드 시 미사용 CSS 제거 (PurgeCSS)

### **Backend**
- **비동기 처리**: FastAPI + Motor의 async/await 패턴
- **효율적 쿼리**: MongoDB 인덱싱 (user_id, diary_id 등)
- **Lifespan 관리**: 앱 시작 시 DB 연결, 종료 시 연결 해제

### **Database**
- **ObjectId 사용**: 효율적인 문서 참조
- **Aggregation**: 좋아요 수 계산 시 `count_documents` 사용
- **조건부 쿼리**: 공개/비공개 필터링

---

## 🚀 배포 환경 (권장)

### **프론트엔드**
- **Vercel** / **Netlify**: Vite 앱 정적 호스팅
- **환경변수**: `VITE_API_BASE_URL`

### **백엔드**
- **Render** / **Railway** / **AWS EC2**: FastAPI 앱 호스팅
- **Uvicorn**: ASGI 서버로 실행
- **환경변수**: `MONGODB_URL`, `DATABASE_NAME`, `SECRET_KEY`

### **데이터베이스**
- **MongoDB Atlas**: 클라우드 MongoDB 서비스
- **로컬 개발**: MongoDB 로컬 설치

---

## 🔧 개발 환경 설정

### **Backend 실행**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### **Frontend 실행**
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### **MongoDB 실행**
```bash
mongosh  # MongoDB 접속
use diary_db  # 데이터베이스 선택
```

---

## 📝 주요 기능

1. **사용자 관리**
   - 회원가입, 로그인, 로그아웃
   - 프로필 이미지 업로드
   - 회원정보 수정 (닉네임, 이메일, 비밀번호)

2. **일기 관리**
   - 일기 작성 (공개/비공개 설정)
   - 일기 수정/삭제 (본인만)
   - 공개 일기 목록 보기 (페이지네이션)
   - 내 일기 목록 보기 (공개+비공개, 페이지네이션)
   - 일기 상세 보기

3. **소셜 기능**
   - 댓글 작성/수정/삭제
   - 일기/댓글 좋아요
   - 내가 작성한 댓글 목록

4. **UI/UX**
   - 반응형 디자인
   - 로딩 상태 표시
   - 에러 처리
   - 페이지네이션
   - 스크롤 위치 관리

---

## 🎯 기술적 특징

1. **타입 안정성**: Pydantic을 통한 API 요청/응답 검증
2. **비동기 처리**: FastAPI + Motor의 완전한 비동기 아키텍처
3. **모듈화**: 라우터, 모델, 서비스 계층 분리
4. **재사용성**: 컴포넌트 기반 설계
5. **보안**: JWT 인증, 비밀번호 해싱, 권한 검증
6. **확장성**: RESTful API로 다양한 클라이언트 지원 가능

---

## 📊 프로젝트 통계 (현재)

- **총 사용자**: 9명
- **총 게시글**: 36개
- **총 댓글**: 137개
- **총 좋아요**: 다수

---

## 📚 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev/)
- [MongoDB 공식 문서](https://www.mongodb.com/docs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Vite 공식 문서](https://vitejs.dev/)
