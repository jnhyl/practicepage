from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB 연결 설정 (환경변수 사용 권장)
MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.environ.get("DATABASE_NAME", "diary_db")

# MongoDB 클라이언트
client = None
database = None


async def connect_to_mongo():
    """MongoDB에 연결"""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL, server_api=ServerApi('1'))
        database = client[DATABASE_NAME]
        # 연결 테스트
        await client.admin.command('ping')
        print(f"✓ Successfully connected to MongoDB at {MONGODB_URL}")
        print(f"✓ Using database: {DATABASE_NAME}")
    except Exception as e:
        print(f"✗ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """MongoDB 연결 종료"""
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")


def get_database():
    """데이터베이스 인스턴스 반환"""
    return database
