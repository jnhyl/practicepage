use diary_db;

// 원본 및 중복 계정 ID
const originalAdmin1 = ObjectId('68f87b6c13fc19779703ac52');
const duplicateAdmin1 = ObjectId('68f8f794cd7d2334b5ce5f47');
const originalAdmin2 = ObjectId('68f8c38a7faae71dc923b94f');
const duplicateAdmin2 = ObjectId('68f8f794cd7d2334b5ce5f48');

print('=== admin1 게시글 이전 ===');
const admin1Result = db.diaries.updateMany(
  {user_id: duplicateAdmin1},
  {$set: {user_id: originalAdmin1}}
);
print('이전된 admin1 게시글 수:', admin1Result.modifiedCount);

print('\n=== admin2 게시글 이전 ===');
const admin2Result = db.diaries.updateMany(
  {user_id: duplicateAdmin2},
  {$set: {user_id: originalAdmin2}}
);
print('이전된 admin2 게시글 수:', admin2Result.modifiedCount);

print('\n=== 중복 계정 삭제 ===');
const deleteResult = db.users.deleteMany({
  _id: {$in: [duplicateAdmin1, duplicateAdmin2]}
});
print('삭제된 계정 수:', deleteResult.deletedCount);

print('\n=== 최종 확인 ===');
print('admin1 게시글 수:', db.diaries.countDocuments({user_id: originalAdmin1}));
print('admin2 게시글 수:', db.diaries.countDocuments({user_id: originalAdmin2}));
print('총 사용자 수:', db.users.countDocuments());
