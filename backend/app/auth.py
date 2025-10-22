from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

import os
from dotenv import load_dotenv

from app.models.user import TokenData, UserResponse
from app.database import get_database

load_dotenv()

# JWT configuration (use environment variables in production)
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
# Optional OAuth2 설정 (auto_error=False로 토큰이 없어도 에러를 발생시키지 않음)
optional_oauth2_scheme = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """비밀번호 해싱"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """현재 로그인한 사용자 정보 가져오기"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    db = get_database()
    user = await db.users.find_one({"username": token_data.username})

    if user is None:
        raise credentials_exception

    return UserResponse(
        _id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        nickname=user.get("nickname", user["username"]),
        profile_image=user.get("profile_image"),
        created_at=user["created_at"]
    )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_oauth2_scheme)
) -> Optional[UserResponse]:
    """현재 로그인한 사용자 정보 가져오기 (Optional - 로그인하지 않아도 됨)"""
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
    except JWTError:
        return None

    db = get_database()
    user = await db.users.find_one({"username": token_data.username})

    if user is None:
        return None

    return UserResponse(
        _id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        nickname=user.get("nickname", user["username"]),
        profile_image=user.get("profile_image"),
        created_at=user["created_at"]
    )


def user_helper(user) -> dict:
    """MongoDB 사용자 문서를 딕셔너리로 변환"""
    return {
        "_id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "nickname": user.get("nickname", user["username"]),
        "profile_image": user.get("profile_image"),
        "created_at": user["created_at"]
    }
