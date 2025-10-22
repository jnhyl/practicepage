from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """MongoDB ObjectId를 Pydantic에서 사용하기 위한 커스텀 타입"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class DiaryBase(BaseModel):
    """일기 기본 모델"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    is_public: bool = Field(default=True)


class DiaryCreate(DiaryBase):
    """일기 생성 요청 모델 (author는 인증된 사용자로 자동 설정)"""
    pass


class DiaryUpdate(BaseModel):
    """일기 수정 요청 모델"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    is_public: Optional[bool] = None


class DiaryResponse(DiaryBase):
    """일기 응답 모델"""
    id: str = Field(alias="_id")
    author: str  # 작성자 닉네임
    user_id: str  # 작성자 user ID
    author_profile_image: Optional[str] = None
    likes_count: int = 0  # 좋아요 수
    is_liked: bool = False  # 현재 사용자의 좋아요 여부
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "오늘의 일기",
                "content": "오늘은 좋은 하루였다.",
                "author": "홍길동",
                "is_public": True,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        }
