const API_URL = "https://csit-library-system-production.up.railway.app";
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

document.addEventListener("DOMContentLoaded", () => {
    if (currentUser) {
        document.getElementById('loginSection')?.classList.add('hidden');
        document.getElementById('appSection')?.classList.remove('hidden');
        buildSidebar();
        setupUserInterface();
        fetchBooks();
        if (currentUser.role === 'admin') {
            fetchUsers();
            fetchManageBooks();
        }
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const res = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok && (data.success || data.user)) {
                    currentUser = data.user || { username, role: username === 'admin' ? 'admin' : 'student' };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    document.getElementById('loginSection').classList.add('hidden');
                    document.getElementById('appSection').classList.remove('hidden');
                    buildSidebar();
                    setupUserInterface();
                    fetchBooks();
                    if (currentUser.role === 'admin') {
                        fetchUsers();
                        fetchManageBooks();
                    }
                } else {
                    alert(data.message || "ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە");
                }
            } catch (err) {
                console.error(err);
                alert('کێشە لە پەیوەندیکردن بە سێرڤەرەوە هەیە!');
            }
        });
    }

    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('bookTitle').value);
            formData.append('author', document.getElementById('bookAuthor').value);
            formData.append('category', document.getElementById('bookCategory').value);
            
            const bookFile = document.getElementById('bookFile').files[0];
            if (bookFile) formData.append('bookFile', bookFile);

            const coverImage = document.getElementById('coverImage').files[0];
            if (coverImage) formData.append('coverImage', coverImage);

            try {
                const res = await fetch(`${API_URL}/api/books`, { method: 'POST', body: formData });
                if (res.ok) {
                    alert('بە سەرکەوتوویی کتێبەکە ئەپلۆد کرا!');
                    bookForm.reset();
                    fetchBooks();
                    fetchManageBooks();
                    switchTab('home');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const role = document.getElementById('newRole').value;

            try {
                const res = await fetch(`${API_URL}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role })
                });
                if (res.ok) {
                    alert('بەکارهێنەر دروستکرا!');
                    userForm.reset();
                    fetchUsers();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = document.getElementById('profilePicFile').files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profilePic', file);
            formData.append('username', currentUser.username);

            try {
                const res = await fetch(`${API_URL}/api/profile`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    currentUser.profilePic = data.profilePic;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    setupUserInterface();
                    alert('وێنەی پڕۆفایل نوێکرایەوە!');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const editBookForm = document.getElementById('editBookForm');
    if (editBookForm) {
        editBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editBookId').value;
            const title = document.getElementById('editTitle').value;
            const author = document.getElementById('editAuthor').value;
            const category = document.getElementById('editCategory').value;

            try {
                const res = await fetch(`${API_URL}/api/books/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, author, category })
                });
                if (res.ok) {
                    alert('نوێکرایەوە!');
                    closeEditModal();
                    fetchBooks();
                    fetchManageBooks();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
});

function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    if (currentUser.role === 'admin') {
        nav.innerHTML = `
            <button onclick="switchTab('home')" id="nav-home" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition">
                <i data-lucide="home" class="w-4 h-4"></i> HOME
            </button>
            <button onclick="switchTab('upload')" id="nav-upload" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="cloud-upload" class="w-4 h-4"></i> UPLOAD
            </button>
            <button onclick="switchTab('manage-books')" id="nav-manage-books" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="file-edit" class="w-4 h-4"></i> MANAGE BOOKS
            </button>
            <button onclick="switchTab('users')" id="nav-users" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="users" class="w-4 h-4"></i> USERS
            </button>
            <button onclick="switchTab('setting')" id="nav-setting" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="settings" class="w-4 h-4"></i> SETTING
            </button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="switchTab('home')" id="nav-home" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition">
                <i data-lucide="home" class="w-4 h-4"></i> HOME
            </button>
            <button onclick="switchTab('favorite')" id="nav-favorite" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="star" class="w-4 h-4"></i> FAVORITE
            </button>
            <button onclick="switchTab('setting')" id="nav-setting" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="settings" class="w-4 h-4"></i> SETTING
            </button>
        `;
    }
    lucide.createIcons();
}

function setupUserInterface() {
    if (!currentUser) return;
    document.getElementById('headerUserName').innerText = currentUser.username;
    if (currentUser.profilePic) {
        const pic = document.getElementById('headerProfilePic');
        pic.src = currentUser.profilePic;
        pic.classList.remove('hidden');
        document.getElementById('headerProfileFallback').classList.add('hidden');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

function switchTab(tabName) {
    const tabs = ['home', 'upload', 'manage-books', 'users', 'favorite', 'setting', 'book-detail'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.add('hidden');
        const nav = document.getElementById(`nav-${t}`);
        if (nav) {
            nav.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
            nav.classList.add('text-slate-400');
        }
    });

    document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-400');
        activeNav.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/20');
    }
    document.getElementById('breadcrumbText').innerText = `Library System >> ${tabName.toUpperCase()}`;
}

async function fetchBooks() {
    try {
        const res = await fetch(`${API_URL}/api/books`);
        const books = await res.json();
        
        const grid = document.getElementById('booksGrid');
        if (grid) {
            grid.innerHTML = '';
            if (!books || books.length === 0) {
                grid.innerHTML = `<p class="text-slate-400 text-sm col-span-full">هیچ کتێبێک نەدۆزراوەتەوە.</p>`;
                return;
            }
            books.forEach(b => {
                const bookId = b._id || b.id;
                grid.innerHTML += `
                    <div class="bg-[#161f33] rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl relative">
                        <div onclick="openBookDetails('${bookId}', '${b.title}', '${b.author}', '${b.coverUrl || ''}')" class="h-48 bg-slate-900 flex items-center justify-center overflow-hidden relative cursor-pointer">
                            ${b.coverUrl ? `<img src="${b.coverUrl}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`}
                        </div>
                        <button onclick="toggleFavorite('${bookId}')" class="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-amber-400 hover:scale-110 transition z-10">
                            <i data-lucide="star" class="w-4 h-4"></i>
                        </button>
                        <div class="p-4 space-y-2">
                            <span class="bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">${b.category || 'General'}</span>
                            <h4 onclick="openBookDetails('${bookId}', '${b.title}', '${b.author}', '${b.coverUrl || ''}')" class="font-bold text-white text-base leading-snug cursor-pointer hover:text-blue-400">${b.title}</h4>
                            <p class="text-xs text-slate-400">By: ${b.author}</p>
                            ${b.fileUrl ? `<a href="${b.fileUrl}" target="_blank" class="block text-center mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl font-medium transition">Download PDF</a>` : ''}
                        </div>
                    </div>
                `;
            });
            lucide.createIcons();
        }
    } catch (err) {
        console.error(err);
    }
}

function openBookDetails(bookId, title, author, coverUrl) {
    switchTab('book-detail');
    document.getElementById('detailBookTitle').innerText = title;
    document.getElementById('detailBookAuthor').innerText = `By: ${author}`;
    
    const coverDiv = document.getElementById('detailBookCover');
    if (coverUrl && coverUrl !== 'undefined') {
        coverDiv.innerHTML = `<img src="${coverUrl}" class="w-full h-full object-cover">`;
    } else {
        coverDiv.innerHTML = `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`;
    }

    const partsGrid = document.getElementById('bookPartsGrid');
    partsGrid.innerHTML = '';
    for (let i = 1; i <= 18; i++) {
        const formattedNum = i < 10 ? `0${i}` : `${i}`;
        partsGrid.innerHTML += `
            <div onclick="alert('کردنەوەی بەشی ${i}')" class="bg-[#111827] hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl flex items-center justify-center cursor-pointer transition shadow-lg group">
                <span class="text-2xl font-bold text-slate-200 group-hover:text-blue-400">${formattedNum}</span>
            </div>
        `;
    }
    lucide.createIcons();
}

async function fetchManageBooks() {
    try {
        const res = await fetch(`${API_URL}/api/books`);
        const books = await res.json();
        const list = document.getElementById('manageBooksList');
        if (list) {
            list.innerHTML = '';
            books.forEach(b => {
                const id = b._id || b.id;
                list.innerHTML += `
                    <div class="bg-[#111827] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <h4 class="font-bold text-white text-sm">${b.title}</h4>
                            <p class="text-xs text-slate-400">${b.author} | ${b.category}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="openEditModal('${id}', '${b.title}', '${b.author}', '${b.category}')" class="bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold">Edit</button>
                            <button onclick="deleteBook('${id}')" class="bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold">Delete</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

async function deleteBook(id) {
    if (!confirm('دڵنیایت لە سڕینەوەی ئەم کتێبە؟')) return;
    try {
        const res = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchBooks();
            fetchManageBooks();
        }
    } catch (err) { console.error(err); }
}

function openEditModal(id, title, author, category) {
    document.getElementById('editBookId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editAuthor').value = author;
    document.getElementById('editCategory').value = category;
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/api/users`);
        const users = await res.json();
        const list = document.getElementById('usersList');
        if (list) {
            list.innerHTML = '';
            users.forEach(u => {
                const uid = u._id || u.username;
                list.innerHTML += `
                    <div class="bg-[#111827] p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                        <span>${u.username} (${u.role})</span>
                        <button onclick="deleteUser('${uid}')" class="text-red-400 text-xs bg-red-950/40 px-3 py-1 rounded-lg">Delete</button>
                    </div>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

async function deleteUser(id) {
    if (!confirm('دڵنیایت؟')) return;
    try {
        await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    } catch (err) { console.error(err); }
}

function toggleFavorite(id) {
    let favs = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favs.includes(id)) {
        favs = favs.filter(fav => fav !== id);
        alert('لە دڵخوازەکان لادرا');
    } else {
        favs.push(id);
        alert('بۆ دڵخوازەکان زیادکرا');
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
}