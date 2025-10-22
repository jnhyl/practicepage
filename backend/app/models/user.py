from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """사용자 기본 모델"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    nickname: Optional[str] = Field(None, max_length=50)


class UserCreate(UserBase):
    """사용자 생성 요청 모델"""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """로그인 요청 모델"""
    username: str
    password: str


class UserResponse(UserBase):
    """사용자 응답 모델"""
    id: str = Field(alias="_id")
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Token(BaseModel):
    """토큰 응답 모델"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """토큰 데이터 모델"""
    username: Optional[str] = None


class UserUpdate(BaseModel):
    """사용자 정보 수정 요청 모델"""
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
