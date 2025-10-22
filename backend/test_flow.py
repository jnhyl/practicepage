import urllib.request
import urllib.parse
import json
import sys
import time

BASE = 'http://127.0.0.1:8000/api'
TS = str(int(time.time()))
USER = f'testflow_{TS}'
EMAIL = f'{USER}@example.com'
PASSWORD = 'Testpass1'

headers = {'Content-Type': 'application/json'}

def post(path, data, token=None):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode()

def get(path, token=None):
    url = BASE + path
    req = urllib.request.Request(url, headers={'Accept':'application/json'})
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode()

def put(path, data, token=None):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='PUT')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode()

def delete(path, token=None):
    url = BASE + path
    req = urllib.request.Request(url, method='DELETE')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code

print('Registering', USER)
reg = post('/auth/register', {'username': USER, 'nickname': USER, 'email': EMAIL, 'password': PASSWORD})
print('register response:', reg)
regj = json.loads(reg)
TOKEN = regj.get('access_token')
if not TOKEN:
    print('Failed to get token', file=sys.stderr)
    sys.exit(1)
print('Token obtained')

# create diary
print('Creating diary')
create_diary = post('/diaries', {'title': f'Auto {TS}', 'content': 'Auto content', 'is_public': True}, TOKEN)
print('create diary response:', create_diary)
di = json.loads(create_diary)
DIARY_ID = di.get('_id')

# create comment
print('Creating comment')
create_comment = post(f'/diaries/{DIARY_ID}/comments', {'content': 'Auto comment'}, TOKEN)
print('create comment response:', create_comment)
ci = json.loads(create_comment)
COMMENT_ID = ci.get('id') or ci.get('_id')

# get my diaries
print('\n/my/diaries:')
print(get('/diaries/me', TOKEN))

# get my comments
print('\n/my/comments:')
print(get('/comments/me', TOKEN))

# update diary
print('Updating diary')
print(put(f'/diaries/{DIARY_ID}', {'title': 'Updated via script'}, TOKEN))

# update comment
print('Updating comment')
print(put(f'/comments/{COMMENT_ID}', {'content': 'Updated comment via script'}, TOKEN))

# delete comment
print('Deleting comment status:', delete(f'/comments/{COMMENT_ID}', TOKEN))
# delete diary
print('Deleting diary status:', delete(f'/diaries/{DIARY_ID}', TOKEN))

print('\nFinal /diaries/me:')
print(get('/diaries/me', TOKEN))
print('\nFinal /comments/me:')
print(get('/comments/me', TOKEN))

print('\nDone')
