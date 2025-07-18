const express = require('express');
const cors = require('cors');
const app = express();

// --- 中介軟體 (Middleware) ---
app.use(cors()); // 允許所有跨來源請求IQ180
app.use(express.json()); // 讓 Express 能請求中 JSON 格式的資料

//用戶資料
let accounts = [
      { username: 'Teacher', password: '812teacher', isadmin: true },
      { username: '81201', password: '123456', isAdmin: false },
      { username: '81202', password: '221102', isAdmin: false },
      { username: '81203', password: '123456', isAdmin: false },
      { username: '81204', password: '123456', isAdmin: false },
      { username: '81205', password: '123456', isAdmin: false },
      { username: '81206', password: 'Llh0410', isAdmin: false },
      { username: '81208', password: '123456', isAdmin: false },
      { username: '81209', password: '123456', isAdmin: false },
      { username: '81210', password: '123456', isAdmin: false },
      { username: '81211', password: '123456', isAdmin: false },
      { username: '81213', password: '123456', isAdmin: false },
      { username: '81226-admin', password: 'adam375106.', isAdmin: true },
      { username: '81227', password: '123456', isAdmin: false },
      { username: '81229', password: '100713', isAdmin: false },
      { username: '81230', password: '123456', isAdmin: false },
      { username: '81231', password: 'linlin1209', isAdmin: false },
      { username: '81232', password: '123456', isAdmin: false },
      { username: '81233', password: '123456', isAdmin: false },
      { username: '81234', password: '123456', isAdmin: false },
      { username: '81237', password: '123456', isAdmin: false }
];
let posts = []; // 文章在記憶體



// 測試路由：確認伺服器是否活著
app.get('/', (req, res) => {
  res.send('哈囉！812 後端伺服器運行中！');
});

// 登入 API
app.post('/login', (req, res) => {
  const { username, password } = req.body; // 取得從前端送來的帳密
  console.log('Login attempt:', username); // 在後端印出log，方便除錯

  const account = accounts.find(acc => acc.username === username && acc.password === password);

  if (account) {
    console.log('Login successful for:', username);
    // 只回傳必要的用戶資訊
    res.json({ username: account.username, isAdmin: account.isAdmin });
  } else {
    console.log('Login failed for:', username);
    // 使用 401 Unauthorized 狀態碼表示驗證失敗(LOL)
    res.status(401).json({ message: '帳號或密碼錯誤' });
  }
});

// 取得所有文章 API
app.get('/posts', (req, res) => {
  // 把最新的文章放前面
  res.json([...posts].reverse());
});

// 新增文章 API
app.post('/posts', (req, res) => {
  // 驗證輸入
  // 暫時先假設前端會傳送 author 過來，之後要改成用 token 驗證
  const { content, author } = req.body;
  if (!content || !author) {
    return res.status(400).json({ message: '缺少文章內容或作者' });
  }

  const newPost = {
    id: Date.now(), // 簡單用時間戳當 ID
    author: author,
    content: content,
    date: new Date().toLocaleString()
  };
  posts.push(newPost);
  console.log('New post added by:', author);
  // 回傳 201 ✅
  res.status(201).json(newPost);
});

// 更改密碼 API
app.post('/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  // 所有必要欄位？
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ message: '缺少必要欄位' });
  }
  
  // 查用戶、驗證密碼
  const userIndex = accounts.findIndex(acc => 
    acc.username === username && acc.password === currentPassword);
  
  if (userIndex === -1) {
    return res.status(401).json({ message: '用戶名或當前密碼錯誤' });
  }
  
  // 更新密碼
  accounts[userIndex].password = newPassword;
  console.log('Password changed for:', username);
  
  res.json({ message: '密碼更改成功' });
});

// 刪除文章 API 
app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  
  // 查用戶、是否為管理員
  const account = accounts.find(acc => acc.username === username);
  
  if (!account || !account.isAdmin) {
    return res.status(403).json({ message: '權限不足：只有管理員可以刪除文章' });
  }
  
  // 找
  const postIndex = posts.findIndex(post => post.id.toString() === id);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: '找不到該文章' });
  }
  
  // 刪除
  posts.splice(postIndex, 1);
  console.log('Post deleted by admin:', username, 'Post ID:', id);
  
  res.json({ message: '文章已成功刪除' });
});


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`伺服器正在監聽 port ${PORT}...`);
});
