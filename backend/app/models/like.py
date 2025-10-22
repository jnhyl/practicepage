from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class LikeBase(BaseModel):
    """좋아요 기본 모델"""
    target_type: Literal["diary", "comment"]  # 대상 타입
    target_id: str  # diary_id 또는 comment_id


class LikeResponse(BaseModel):
    """좋아요 응답 모델"""
    id: str = Field(alias="_id")
    target_type: Literal["diary", "comment"]
    target_id: str
    user_id: str
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
