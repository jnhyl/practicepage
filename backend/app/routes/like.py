from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId

from app.models.user import UserResponse
from app.database import get_database
from app.auth import get_current_user

router = APIRouter()


@router.post("/diaries/{diary_id}/like")
async def toggle_diary_like(
    diary_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """일기 좋아요 토글 (인증 필요)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    # 일기 존재 확인
    diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})
    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diary with id {diary_id} not found"
        )

    # 이미 좋아요를 눌렀는지 확인
    existing_like = await db.likes.find_one({
        "target_type": "diary",
        "target_id": ObjectId(diary_id),
        "user_id": ObjectId(current_user.id)
    })

    if existing_like:
        # 좋아요 취소
        await db.likes.delete_one({"_id": existing_like["_id"]})
        liked = False
    else:
        # 좋아요 추가
        like_dict = {
            "target_type": "diary",
            "target_id": ObjectId(diary_id),
            "user_id": ObjectId(current_user.id),
            "created_at": datetime.now(timezone.utc)
        }
        await db.likes.insert_one(like_dict)
        liked = True

    # 전체 좋아요 수 계산
    likes_count = await db.likes.count_documents({
        "target_type": "diary",
        "target_id": ObjectId(diary_id)
    })

    return {
        "liked": liked,
        "likes_count": likes_count
    }


@router.post("/comments/{comment_id}/like")
async def toggle_comment_like(
    comment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """댓글 좋아요 토글 (인증 필요)"""
    db = get_database()

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid comment ID format"
        )

    # 댓글 존재 확인
    comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found"
        )

    # 이미 좋아요를 눌렀는지 확인
    existing_like = await db.likes.find_one({
        "target_type": "comment",
        "target_id": ObjectId(comment_id),
        "user_id": ObjectId(current_user.id)
    })

    if existing_like:
        # 좋아요 취소
        await db.likes.delete_one({"_id": existing_like["_id"]})
        liked = False
    else:
        # 좋아요 추가
        like_dict = {
            "target_type": "comment",
            "target_id": ObjectId(comment_id),
            "user_id": ObjectId(current_user.id),
            "created_at": datetime.now(timezone.utc)
        }
        await db.likes.insert_one(like_dict)
        liked = True

    # 전체 좋아요 수 계산
    likes_count = await db.likes.count_documents({
        "target_type": "comment",
        "target_id": ObjectId(comment_id)
    })

    return {
        "liked": liked,
        "likes_count": likes_count
    }
