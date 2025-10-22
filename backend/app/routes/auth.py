from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
import os
import shutil
from pathlib import Path

from app.models.user import UserCreate, UserLogin, Token, UserResponse, UserUpdate
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    user_helper,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import get_database

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """회원가입"""
    db = get_database()

    # 이미 존재하는 사용자명 확인
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # 이미 존재하는 이메일 확인
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 사용자 생성
    user_dict = {
        "username": user.username,
        "email": user.email,
        "nickname": user.nickname if user.nickname else user.username,
        "profile_image": None,
        "hashed_password": get_password_hash(user.password),
        "created_at": datetime.now(timezone.utc)
    }

    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})

    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_helper(created_user))
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """로그인"""
    db = get_database()

    # 사용자 찾기
    user = await db.users.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 비밀번호 검증
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_helper(user))
    )


@router.post("/login-json", response_model=Token)
async def login_json(user_login: UserLogin):
    """JSON 형식 로그인 (프론트엔드용)"""
    db = get_database()

    # 사용자 찾기
    user = await db.users.find_one({"username": user_login.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # 비밀번호 검증
    if not verify_password(user_login.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_helper(user))
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """현재 로그인한 사용자 정보"""
    return current_user


@router.post("/upload-profile-image", response_model=UserResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """프로필 사진 업로드"""
    # 허용된 파일 형식 확인
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"
        )

    # uploads 디렉토리 생성
    upload_dir = Path("uploads/profile_images")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # 파일명 생성 (사용자 ID + 확장자)
    filename = f"{current_user.id}{file_extension}"
    file_path = upload_dir / filename

    # 파일 저장
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

    # 데이터베이스 업데이트
    db = get_database()
    profile_image_url = f"/uploads/profile_images/{filename}"

    await db.users.update_one(
        {"username": current_user.username},
        {"$set": {"profile_image": profile_image_url}}
    )

    # 업데이트된 사용자 정보 반환
    updated_user = await db.users.find_one({"username": current_user.username})
    return UserResponse(**user_helper(updated_user))


@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """회원정보 수정"""
    db = get_database()
    
    # 현재 사용자 정보 조회
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 업데이트할 필드 수집
    update_fields = {}
    
    # 닉네임 업데이트
    if update_data.nickname is not None:
        update_fields["nickname"] = update_data.nickname
    
    # 이메일 업데이트
    if update_data.email is not None:
        # 이메일 중복 확인
        existing_email = await db.users.find_one({
            "email": update_data.email,
            "username": {"$ne": current_user.username}
        })
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        update_fields["email"] = update_data.email
    
    # 비밀번호 변경
    if update_data.new_password is not None:
        if not update_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )
        
        # 현재 비밀번호 확인
        if not verify_password(update_data.current_password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # 새 비밀번호 해시화
        update_fields["hashed_password"] = get_password_hash(update_data.new_password)
    
    if update_fields:
        await db.users.update_one(
            {"username": current_user.username},
            {"$set": update_fields}
        )
    
    # 업데이트된 사용자 정보 반환
    updated_user = await db.users.find_one({"username": current_user.username})
    return UserResponse(**user_helper(updated_user))
