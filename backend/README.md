# 일기 공유 API - Backend

FastAPI와 MongoDB를 사용한 일기 공유 애플리케이션 백엔드

## 설치 방법

### 1. 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
```

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. MongoDB 설치 및 실행
로컬에 MongoDB가 설치되어 있어야 합니다.
```bash
# MongoDB 실행 (이미 설치되어 있다고 가정)
mongod
```

### 4. 환경 변수 설정
`.env.example`을 참고하여 `.env` 파일을 생성하세요.

## 실행 방법

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 실행되면 다음 주소에서 접근 가능합니다:
- API: http://localhost:8000
- API 문서 (Swagger): http://localhost:8000/docs
- API 문서 (ReDoc): http://localhost:8000/redoc

## API 엔드포인트

### 일기 관련 API
- `POST /api/diaries` - 일기 생성
- `GET /api/diaries` - 일기 목록 조회 (페이지네이션 지원)
- `GET /api/diaries/{diary_id}` - 일기 상세 조회
- `PUT /api/diaries/{diary_id}` - 일기 수정
- `DELETE /api/diaries/{diary_id}` - 일기 삭제

### 기타 API
- `GET /` - 루트 엔드포인트
- `GET /health` - 헬스 체크

## 프로젝트 구조
```
backend/
├── app/
│   ├── routes/
│   │   └── diary.py      # 일기 API 라우트
│   ├── models/
│   │   └── diary.py      # Pydantic 모델
│   ├── database.py       # MongoDB 연결
│   └── main.py           # FastAPI 앱
├── requirements.txt
└── README.md
```

## 기술 스택
- FastAPI: 웹 프레임워크
- Motor: MongoDB 비동기 드라이버
- Pydantic: 데이터 검증
- MongoDB: 데이터베이스
