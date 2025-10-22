from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.models.diary import DiaryCreate, DiaryUpdate, DiaryResponse
from app.models.user import UserResponse
from app.database import get_database
from app.auth import get_current_user, get_current_user_optional

router = APIRouter()


async def diary_helper(diary, current_user_id: str = None) -> dict:
    """MongoDB 문서를 딕셔너리로 변환"""
    db = get_database()
    diary_id = diary["_id"]

    # 좋아요 수 계산
    likes_count = await db.likes.count_documents({
        "target_type": "diary",
        "target_id": diary_id
    })

    # 현재 사용자의 좋아요 여부 확인
    is_liked = False
    if current_user_id:
        like = await db.likes.find_one({
            "target_type": "diary",
            "target_id": diary_id,
            "user_id": ObjectId(current_user_id)
        })
        is_liked = like is not None

    # 작성자의 프로필 이미지 가져오기
    author_profile_image = None
    if diary.get("user_id"):
        author = await db.users.find_one({"_id": ObjectId(diary["user_id"])})
        if author:
            author_profile_image = author.get("profile_image")

    return {
        "_id": str(diary["_id"]),
        "title": diary["title"],
        "content": diary["content"],
        "author": diary.get("author", "익명"),
        "user_id": str(diary.get("user_id", "")),
        "author_profile_image": author_profile_image,
        "likes_count": likes_count,
        "is_liked": is_liked,
        "is_public": diary["is_public"],
        "created_at": diary["created_at"],
        "updated_at": diary["updated_at"]
    }


@router.post("/", response_model=DiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_diary(
    diary: DiaryCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """일기 생성 (인증 필요)"""
    db = get_database()

    diary_dict = diary.model_dump()
    diary_dict["author"] = current_user.nickname if current_user.nickname else current_user.username  # 작성자를 닉네임으로 설정
    diary_dict["user_id"] = ObjectId(current_user.id)  # 사용자 ID를 ObjectId로 저장
    diary_dict["created_at"] = datetime.now(timezone.utc)
    diary_dict["updated_at"] = datetime.now(timezone.utc)

    result = await db.diaries.insert_one(diary_dict)
    created_diary = await db.diaries.find_one({"_id": result.inserted_id})

    return await diary_helper(created_diary, current_user.id)


@router.get("/")
async def get_diaries(
    skip: int = 0,
    limit: int = 10,
    public_only: bool = True,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """일기 목록 조회 (로그인 선택 사항)"""
    db = get_database()

    query = {"is_public": True} if public_only else {}

    # 전체 개수 조회
    total = await db.diaries.count_documents(query)

    diaries = await db.diaries.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    # 좋아요 정보를 포함하여 반환 (로그인한 경우 사용자 ID 전달)
    user_id = current_user.id if current_user else None
    result = []
    for diary in diaries:
        result.append(await diary_helper(diary, user_id))

    return {
        "items": result,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/me")
async def get_my_diaries(
    skip: int = 0,
    limit: int = 10,
    current_user: UserResponse = Depends(get_current_user)
):
    """현재 인증된 사용자의 모든 일기(비공개 포함) 반환"""
    db = get_database()

    query = {"user_id": ObjectId(current_user.id)}

    # 전체 개수 조회
    total = await db.diaries.count_documents(query)

    diaries = await db.diaries.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for diary in diaries:
        result.append(await diary_helper(diary, current_user.id))

    return {
        "items": result,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{diary_id}")
async def get_diary(
    diary_id: str,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """일기 상세 조회 (로그인 선택 사항)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diary with id {diary_id} not found"
        )

    # 로그인한 경우 사용자 ID 전달
    user_id = current_user.id if current_user else None
    return await diary_helper(diary, user_id)


@router.put("/{diary_id}")
async def update_diary(
    diary_id: str,
    diary_update: DiaryUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """일기 수정 (인증 필요, 본인 글만 가능)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    # 일기 찾기
    diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})
    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diary with id {diary_id} not found"
        )

    # 작성자 확인
    if str(diary.get("user_id")) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own diaries"
        )

    # 수정할 필드만 추출 (None이 아닌 값만)
    update_data = {k: v for k, v in diary_update.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.diaries.update_one(
        {"_id": ObjectId(diary_id)},
        {"$set": update_data}
    )

    updated_diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})
    return await diary_helper(updated_diary, current_user.id)


@router.delete("/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary(
    diary_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """일기 삭제 (인증 필요, 본인 글만 가능)"""
    db = get_database()

    if not ObjectId.is_valid(diary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diary ID format"
        )

    # 일기 찾기
    diary = await db.diaries.find_one({"_id": ObjectId(diary_id)})
    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diary with id {diary_id} not found"
        )

    # 작성자 확인
    if str(diary.get("user_id")) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own diaries"
        )

    result = await db.diaries.delete_one({"_id": ObjectId(diary_id)})

    return None
