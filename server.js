const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const DB_FILE = path.join(__dirname, 'database.json');

function getDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [{ username: 'admin', password: '123', role: 'admin' }],
            books: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە' });
    }
});

app.get('/api/books', (req, res) => {
    const db = getDB();
    res.json(db.books);
});

app.post('/api/books', upload.fields([{ name: 'bookFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
    const db = getDB();
    const { title, author, category } = req.body;
    const host = req.get('host');
    const protocol = req.protocol;

    const newBook = {
        id: Date.now().toString(),
        title,
        author,
        category,
        fileUrl: req.files['bookFile'] ? `${protocol}://${host}/uploads/${req.files['bookFile'][0].filename}` : null,
        coverUrl: req.files['coverImage'] ? `${protocol}://${host}/uploads/${req.files['coverImage'][0].filename}` : null
    };

    db.books.push(newBook);
    saveDB(db);
    res.json({ success: true, book: newBook });
});

app.put('/api/books/:id', (req, res) => {
    const db = getDB();
    const bookIndex = db.books.findIndex(b => b.id === req.params.id || b._id === req.params.id);
    if (bookIndex !== -1) {
        db.books[bookIndex] = { ...db.books[bookIndex], ...req.body };
        saveDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'کتێب نەدۆزراوەتەوە' });
    }
});

app.delete('/api/books/:id', (req, res) => {
    let db = getDB();
    db.books = db.books.filter(b => b.id !== req.params.id && b._id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => {
    const db = getDB();
    res.json(db.users);
});

app.post('/api/users', (req, res) => {
    const db = getDB();
    const { username, password, role } = req.body;
    db.users.push({ id: Date.now().toString(), username, password, role });
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
    let db = getDB();
    db.users = db.users.filter(u => u.id !== req.params.id && u.username !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/profile', upload.single('profilePic'), (req, res) => {
    const db = getDB();
    const { username } = req.body;
    const user = db.users.find(u => u.username === username);
    if (user && req.file) {
        const host = req.get('host');
        const protocol = req.protocol;
        user.profilePic = `${protocol}://${host}/uploads/${req.file.filename}`;
        saveDB(db);
        res.json({ success: true, profilePic: user.profilePic });
    } else {
        res.status(400).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});