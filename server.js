const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app       = express();
const DATA_FILE = path.join(__dirname, 'memos.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { nextId: 1, memos: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 스니펫 페이지
app.get('/snippet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'snippet.html'));
});

// 메모 목록 조회
app.get('/api/memos/:userId', (req, res) => {
  const { memos } = readData();
  const result = memos
    .filter(m => m.user_id === req.params.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 100);
  res.json(result);
});

// 메모 저장
app.post('/api/memos', (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content || !content.trim()) {
    return res.status(400).json({ error: 'userId와 content가 필요해요.' });
  }
  const data = readData();
  const memo = {
    id:         data.nextId++,
    user_id:    userId,
    content:    content.trim(),
    created_at: new Date().toISOString()
  };
  data.memos.push(memo);
  writeData(data);
  res.status(201).json(memo);
});

// 메모 삭제
app.delete('/api/memos/:id', (req, res) => {
  const data  = readData();
  const id    = Number(req.params.id);
  const index = data.memos.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: '해당 메모를 찾지 못했어요.' });
  data.memos.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📌 스니펫 URL: http://localhost:${PORT}/snippet?userId=USER_ID`);
});
