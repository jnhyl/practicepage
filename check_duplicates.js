use diary_db;

console.log('=== Checking for duplicate usernames ===');
db.users.aggregate([
  {$group: {_id: '$username', count: {$sum: 1}}},
  {$match: {count: {$gt: 1}}}
]).forEach(doc => {
  console.log('Duplicate username:', doc._id, '- Count:', doc.count);
});

console.log('');
console.log('=== All admin accounts ===');
db.users.find({username: /^admin/}).forEach(u => {
  console.log('Username:', u.username, '| Email:', u.email, '| Nickname:', u.nickname, '| ID:', u._id);
});

console.log('');
console.log('=== Total users ===');
console.log('Total:', db.users.countDocuments());
