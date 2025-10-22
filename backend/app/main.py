from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import diary, auth, comment, like


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 실행
    await connect_to_mongo()
    yield
    # 종료 시 실행
    await close_mongo_connection()


app = FastAPI(
    title="일기 공유 API",
    description="간단한 일기 공유 웹 애플리케이션 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (React 프론트엔드와 통신을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "일기 공유 API에 오신 것을 환영합니다!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(diary.router, prefix="/api/diaries", tags=["diaries"])
app.include_router(comment.router, prefix="/api", tags=["comments"])
app.include_router(like.router, prefix="/api", tags=["likes"])

# 정적 파일 서빙 (프로필 이미지)
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
