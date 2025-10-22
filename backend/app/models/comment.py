from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class CommentBase(BaseModel):
    """댓글 기본 모델"""
    content: str = Field(..., min_length=1, max_length=500)


class CommentCreate(CommentBase):
    """댓글 생성 요청 모델"""
    pass


class CommentUpdate(BaseModel):
    """댓글 수정 요청 모델"""
    content: str = Field(..., min_length=1, max_length=500)


class CommentResponse(CommentBase):
    """댓글 응답 모델"""
    id: str = Field(alias="_id")
    diary_id: str  # 일기 ID
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
                "diary_id": "507f1f77bcf86cd799439012",
                "content": "좋은 글이네요!",
                "author": "홍길동",
                "user_id": "507f1f77bcf86cd799439013",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        }
