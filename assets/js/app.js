let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    
    if (currentUser) {
        document.getElementById('loginSection')?.classList.add('hidden');
        document.getElementById('appSection')?.classList.remove('hidden');
        setupUserInterface();
        fetchBooks();
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('appSection').classList.remove('hidden');
            setupUserInterface();
            fetchBooks();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('تکایە دڵنیابە سێرڤەرەکە کار دەکات!');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

function setupUserInterface() {
    document.getElementById('headerUserName').innerText = currentUser.name;
    if (currentUser.profilePic) {
        const pic = document.getElementById('headerProfilePic');
        pic.src = currentUser.profilePic;
        pic.classList.remove('hidden');
    }

    if (currentUser.role === 'admin') {
        document.getElementById('adminUserSection')?.classList.remove('hidden');
    }
}

function switchTab(tabName) {
    ['dashboard', 'books', 'settings'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        document.getElementById(`nav-${t}`)?.classList.remove('bg-blue-600', 'text-white');
        document.getElementById(`nav-${t}`)?.classList.add('text-slate-400');
    });
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`nav-${tabName}`)?.classList.add('bg-blue-600', 'text-white');
    document.getElementById(`nav-${tabName}`)?.classList.remove('text-slate-400');
}

async function fetchBooks() {
    try {
        const res = await fetch('http://localhost:5000/api/books');
        const books = await res.json();
        
        const grid = document.getElementById('availableBooksGrid');
        if (grid) {
            grid.innerHTML = '';
            books.forEach(b => {
                grid.innerHTML += `
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col justify-between">
                        <div class="h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                            ${b.coverUrl ? `<img src="${b.coverUrl}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`}
                        </div>
                        <div class="p-4 space-y-2">
                            <span class="bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">${b.category}</span>
                            <h4 class="font-bold text-base text-white leading-snug">${b.title}</h4>
                            <p class="text-xs text-slate-400">By: ${b.author}</p>
                            ${b.fileUrl ? `<a href="${b.fileUrl}" target="_blank" class="inline-block mt-2 w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg font-medium">Download / View</a>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        const tbody = document.getElementById('booksTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            books.forEach(b => {
                tbody.innerHTML += `
                    <tr class="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td class="p-4">
                            <div class="w-10 h-12 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                                ${b.coverUrl ? `<img src="${b.coverUrl}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-5 h-5 text-slate-500"></i>`}
                            </div>
                        </td>
                        <td class="p-4 font-semibold text-white">${b.title}</td>
                        <td class="p-4">${b.author}</td>
                        <td class="p-4">${b.category}</td>
                        <td class="p-4">${b.fileUrl ? `<a href="${b.fileUrl}" target="_blank" class="text-blue-400 hover:underline text-xs">Download</a>` : 'No file'}</td>
                        <td class="p-4">
                            ${currentUser.role === 'admin' || currentUser.username === b.uploader ? `
                                <button onclick="deleteBook(${b.id})" class="bg-red-600/20 text-red-400 p-2 rounded-lg hover:bg-red-600/40">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            });
        }
        lucide.createIcons();
    } catch (err) {
        console.error(err);
    }
}

async function addBook(e) {
    e.preventDefault();
    if (currentUser.role === 'student') {
        alert('خوێندکار بۆی نییە کتێب ئەپلۆد بکات!');
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('bookTitle').value);
    formData.append('author', document.getElementById('bookAuthor').value);
    formData.append('category', document.getElementById('bookCategory').value);
    formData.append('uploader', currentUser.username);

    const coverFile = document.getElementById('coverImage').files[0];
    if (coverFile) formData.append('coverImage', coverFile);

    const bookFile = document.getElementById('bookFile').files[0];
    if (bookFile) formData.append('bookFile', bookFile);

    const res = await fetch('https://csit-library-system-production.up.railway.app/api/books', { method: 'POST', body: formData });
    if (res.ok) {
        alert('بە سەرکەوتوویی زیادکرا!');
        document.getElementById('bookForm').reset();
        fetchBooks();
    }
}

async function deleteBook(id) {
    await fetch(`https://csit-library-system-production.up.railway.app/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
}

async function createUser(e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const name = document.getElementById('newName').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, password, role })
    });
    const data = await res.json();
    if (data.success) {
        alert('ئەکاونت بە سەرکەوتوویی دروستکرا!');
        e.target.reset();
    } else {
        alert(data.message);
    }
}

async function updateProfilePic(e) {
    e.preventDefault();
    const file = document.getElementById('profilePicFile').files[0];
    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('username', currentUser.username);

    const res = await fetch('http://localhost:5000/api/profile', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        currentUser.profilePic = data.profilePic;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('وێنەی پڕۆفایل گۆڕدرا!');
        setupUserInterface();
    }
}