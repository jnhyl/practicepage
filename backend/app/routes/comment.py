from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.models.comment import CommentCreate, CommentUpdate
from app.models.user import UserResponse
from app.database import get_database
from app.auth import get_current_user, get_current_user_optional

router = APIRouter()


async def comment_helper(comment, current_user_id: str = None) -> dict:
    """MongoDB 문서를 딕셔너리로 변환"""
    db = get_database()
    comment_id = comment["_id"]

    # 좋아요 수 계산
    likes_count = await db.likes.count_documents({
        "target_type": "comment",
        "target_id": comment_id
    })

    # 현재 사용자의 좋아요 여부 확인
    is_liked = False
    if current_user_id:
        like = await db.likes.find_one({
            "target_type": "comment",
            "target_id": comment_id,
            "user_id": ObjectId(current_user_id)
        })
        is_liked = like is not None

    # 작성자의 프로필 이미지 가져오기
    author_profile_image = None
    if comment.get("user_id"):
        author = await db.users.find_one({"_id": ObjectId(comment["user_id"])})
        if author:
            author_profile_image = author.get("profile_image")

    return {
        "_id": str(comment["_id"]),
        "diary_id": str(comment["diary_id"]),
        "content": comment["content"],
        "author": comment["author"],
        "user_id": str(comment["user_id"]),
        "author_profile_image": author_profile_image,
        "likes_count": likes_count,
        "is_liked": is_liked,
        "created_at": comment["created_at"],
        "updated_at": comment["updated_at"]
    }


@router.get("/comments/me")
async def get_my_comments(
    current_user: UserResponse = Depends(get_current_user)
):
    """현재 인증된 사용자의 모든 댓글 반환"""
    db = get_database()
    comments = []
    async for comment in db.comments.find({"user_id": ObjectId(current_user.id)}).sort("created_at", -1):
        comments.append(await comment_helper(comment, current_user.id))

    return comments


@router.post("/diaries/{diary_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(
    diary_id: str,
    comment: CommentCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """댓글 생성 (인증 필요)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    # 일기가 존재하는지 확인
    diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})
    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diary with id {diary_id} not found"
        )

    comment_dict = comment.model_dump()
    comment_dict["diary_id"] = ObjectId(diary_id)
    comment_dict["author"] = current_user.nickname if current_user.nickname else current_user.username
    comment_dict["user_id"] = ObjectId(current_user.id)
    comment_dict["created_at"] = datetime.now(timezone.utc)
    comment_dict["updated_at"] = datetime.now(timezone.utc)

    result = await db.comments.insert_one(comment_dict)
    created_comment = await db.comments.find_one({"_id": result.inserted_id})

    return await comment_helper(created_comment, current_user.id)


@router.get("/diaries/{diary_id}/comments")
async def get_comments(
    diary_id: str,
    sort_by: str = "newest",  # newest 또는 likes
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """특정 일기의 댓글 목록 조회 (로그인 선택 사항)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    # 로그인한 경우 사용자 ID 전달
    user_id = current_user.id if current_user else None
    comments = []
    
    # 각 댓글의 좋아요 수를 미리 계산하여 정렬에 사용
    pipeline = [
        {"$match": {"diary_id": ObjectId(diary_id)}},
        {
            "$lookup": {
                "from": "likes",
                "let": {"comment_id": "$_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$target_type", "comment"]},
                                    {"$eq": ["$target_id", "$$comment_id"]}
                                ]
                            }
                        }
                    }
                ],
                "as": "likes"
            }
        },
        {
            "$addFields": {
                "likes_count": {"$size": "$likes"}
            }
        },
        {
            "$sort": {
                "likes_count" if sort_by == "likes" else "created_at": -1
            }
        }
    ]
    
    async for comment in db.comments.aggregate(pipeline):
        comments.append(await comment_helper(comment, user_id))

    return comments


@router.put("/comments/{comment_id}")
async def update_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """댓글 수정 (인증 필요, 본인만 가능)"""
    db = get_database()

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid comment ID format"
        )

    # 댓글 찾기
    comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found"
        )

    # 작성자 확인
    if str(comment["user_id"]) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )

    # 댓글 수정
    update_data = comment_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": update_data}
    )

    updated_comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    return await comment_helper(updated_comment, current_user.id)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """댓글 삭제 (인증 필요, 본인만 가능)"""
    db = get_database()

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid comment ID format"
        )

    # 댓글 찾기
    comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found"
        )

    # 작성자 확인
    if str(comment["user_id"]) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    # 댓글 삭제
    await db.comments.delete_one({"_id": ObjectId(comment_id)})

    return None
