const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

let users = [
  { id: 1, username: 'admin', password: '123456', role: 'admin', name: 'CSIT Admin', profilePic: '' },
  { id: 2, username: 'teacher1', password: '123456', role: 'teacher', name: 'Dr. Ahmed', profilePic: '' }
];

let books = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Cormen', category: 'CS', fileUrl: '', coverUrl: '', uploader: 'admin' },
  { id: 2, title: 'Data Structures Lecture Notes', author: 'Dr. Ahmed', category: 'Lecture Notes', fileUrl: '', coverUrl: '', uploader: 'teacher1' }
];

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({ success: true, user });
  }
  res.status(401).json({ success: false, message: 'ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە!' });
});

// Create User API (Admin only)
app.post('/api/users', (req, res) => {
  const { username, password, role, name } = req.body;
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'ئەم بەکارهێنەرە پێشتر هەیە!' });
  }
  const newUser = { id: Date.now(), username, password, role, name, profilePic: '' };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// Get Books API
app.get('/api/books', (req, res) => {
  res.json(books);
});

// Add Book / Lecture Note API
app.post('/api/books', upload.fields([{ name: 'bookFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
  const { title, author, category, uploader } = req.body;
  const bookFile = req.files['bookFile'] ? `http://localhost:${PORT}/uploads/${req.files['bookFile'][0].filename}` : '';
  const coverUrl = req.files['coverImage'] ? `http://localhost:${PORT}/uploads/${req.files['coverImage'][0].filename}` : '';
  
  const newBook = {
    id: Date.now(),
    title,
    author,
    category,
    fileUrl: bookFile,
    coverUrl,
    uploader: uploader || 'admin'
  };

  books.push(newBook);
  res.json({ success: true, book: newBook });
});

// Delete Book API
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  books = books.filter(b => b.id !== parseInt(id));
  res.json({ success: true, message: 'کتێبەکە سڕدرایەوە' });
});

// Update Profile Picture
app.post('/api/profile', upload.single('profilePic'), (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (user && req.file) {
    user.profilePic = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    return res.json({ success: true, profilePic: user.profilePic });
  }
  res.status(400).json({ success: false, message: 'هەڵە ڕویدا!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});