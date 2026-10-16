const API_URL = "https://csit-library-system-production.up.railway.app";
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let allBooksCache = [];
let currentLang = localStorage.getItem('appLang') || 'ku';

const translations = {
    ku: {
        home: "سەرەکی",
        favorite: "دڵخوازەکان",
        borrowed: "قەرزکراوەکان",
        upload: "ئەپلۆدکردن",
        manage: "بەڕێوەبردنی کتێب",
        users: "بەکارهێنەران",
        settings: "ڕێکخستنەکان",
        logout: "چوونە دەرەوە",
        welcomeTitle: "بەخێر هاتن بۆ سیستەمی کتێبخانەی CSIT",
        welcomeSub: "زانکۆی کەرکووک - کۆلێژی زانستی کۆمپیوتەر و تەکنەلۆجیای زانیاری",
        uploadTitle: "ئەپلۆدکردنی کتێب یان مەلزەمە",
        bookTitleLbl: "ناوی کتێب / مەلزەمە",
        authorLbl: "مامۆستا / دانەر",
        typeLbl: "جۆر (کتێب قەرزکردن / مەلزەمە بێ کات)",
        partNameLbl: "ناوی بەش (نموونە: Part 1)",
        catLbl: "قۆناغ / بەش",
        pdfLbl: "فایلی PDF",
        coverLbl: "وێنەی بەرگ",
        uploadBtn: "ئەپلۆدکردن",
        manageTitle: "بەڕێوەبردنی کتێبەکان",
        userMgmtTitle: "بەڕێوەبردنی بەکارهێنەران",
        favTitle: "کتێبە دڵخوازەکان",
        borrowedTitle: "کتێبە قەرزکراوەکانی من (ماوەبەسەرچوون)",
        settingsTitle: "ڕێکخستنەکان و پڕۆفایل",
        updatePic: "گۆڕینی وێنەی پڕۆفایل",
        updateBtn: "نوێکردنەوەی وێنە",
        backHome: "گەڕانەوە بۆ سەرەکی",
        partsList: "بەشە بەردەستەکانی ئەم کتێبە",
        borrowBtn: "قەرزکردنی کتێب (بۆ ٧ ڕۆژ)",
        borrowedActive: "قەرزکراوە (ماوەی ماوە: ",
        expired: "ماوەی قەرزکردن تەواو بووە - قفڵکراوە!",
        freeMalzam: "مەلزەمەی بێ کات (خۆڕایی)"
    },
    ar: {
        home: "الرئيسية",
        favorite: "المفضلة",
        borrowed: "الكتب المستعارة",
        upload: "رفع كتاب",
        manage: "إدارة الكتب",
        users: "المستخدمين",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        welcomeTitle: "مرحباً بكم في نظام مكتبة CSIT",
        welcomeSub: "جامعة كركوك - كلية علوم الحاسوب وتكنولوجيا المعلومات",
        uploadTitle: "رفع كتاب أو ملزمة",
        bookTitleLbl: "اسم الكتاب / الملزمة",
        authorLbl: "الأستاذ / المؤلف",
        typeLbl: "النوع (كتاب للاستعارة / ملزمة مجانية)",
        partNameLbl: "اسم الجزء (مثال: Part 1)",
        catLbl: "المرحلة / القسم",
        pdfLbl: "ملف PDF",
        coverLbl: "صورة الغلاف",
        uploadBtn: "رفع المورد",
        manageTitle: "إدارة الكتب",
        userMgmtTitle: "إدارة المستخدمين",
        favTitle: "الكتب المفضلة",
        borrowedTitle: "الكتب المستعارة الخاصة بي",
        settingsTitle: "الإعدادات والملف الشخصي",
        updatePic: "تحديث صورة الملف الشخصي",
        updateBtn: "تحديث الصورة",
        backHome: "العودة للرئيسية",
        partsList: "الأجزاء المتاحة لهذا الكتاب",
        borrowBtn: "استعارة الكتاب (لمدة 7 أيام)",
        borrowedActive: "مستعار (المتبقي: ",
        expired: "انتهت فترة الاستعارة - مقفل!",
        freeMalzam: "ملزمة بدون وقت (مجانية)"
    },
    en: {
        home: "Home",
        favorite: "Favorites",
        borrowed: "Borrowed Books",
        upload: "Upload",
        manage: "Manage Books",
        users: "Users",
        settings: "Settings",
        logout: "Logout",
        welcomeTitle: "Welcome to CSIT Library System",
        welcomeSub: "University of Kirkuk - College of Computer Science & IT",
        uploadTitle: "Upload Book or Note",
        bookTitleLbl: "Book / Note Title",
        authorLbl: "Author / Teacher",
        typeLbl: "Type (Book with Borrowing / Free Note)",
        partNameLbl: "Part Name (e.g. Part 1)",
        catLbl: "Category / Stage",
        pdfLbl: "PDF File",
        coverLbl: "Cover Image",
        uploadBtn: "Upload Resource",
        manageTitle: "Manage Books",
        userMgmtTitle: "User Management",
        favTitle: "Favorite Books",
        borrowedTitle: "My Borrowed Books",
        settingsTitle: "Settings & Profile",
        updatePic: "Update Profile Picture",
        updateBtn: "Update Picture",
        backHome: "Back to Home",
        partsList: "Available Parts",
        borrowBtn: "Borrow Book (7 Days)",
        borrowedActive: "Borrowed (Remaining: ",
        expired: "Borrowing period expired - Locked!",
        freeMalzam: "Free Note (No Expiry)"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
    document.getElementById('langSelect').value = currentLang;

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
                    alert("ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە");
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
            formData.append('title', document.getElementById('bookTitle').value.trim());
            formData.append('author', document.getElementById('bookAuthor').value.trim());
            formData.append('resourceType', document.getElementById('resourceType').value);
            formData.append('partName', document.getElementById('bookPartName').value.trim() || 'General');
            formData.append('category', document.getElementById('bookCategory').value.trim());
            
            const bookFile = document.getElementById('bookFile').files[0];
            if (bookFile) formData.append('bookFile', bookFile);

            const coverImage = document.getElementById('coverImage').files[0];
            if (coverImage) formData.append('coverImage', coverImage);

            try {
                const res = await fetch(`${API_URL}/api/books`, { method: 'POST', body: formData });
                if (res.ok) {
                    alert('بە سەرکەوتوویی ئەپلۆد کرا!');
                    bookForm.reset();
                    fetchBooks();
                    fetchManageBooks();
                    switchTab('home');
                }
            } catch (err) { console.error(err); }
        });
    }
});

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    setLanguage(lang);
    buildSidebar();
}

function setLanguage(lang) {
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });
    const htmlRoot = document.getElementById('htmlRoot');
    if (lang === 'en') {
        htmlRoot.setAttribute('dir', 'ltr');
        htmlRoot.setAttribute('lang', 'en');
    } else if (lang === 'ar') {
        htmlRoot.setAttribute('dir', 'rtl');
        htmlRoot.setAttribute('lang', 'ar');
    } else {
        htmlRoot.setAttribute('dir', 'rtl');
        htmlRoot.setAttribute('lang', 'ku');
    }
}

function toggleTheme() {
    const root = document.documentElement;
    root.classList.toggle('dark');
    const icon = document.getElementById('themeIcon');
    if (root.classList.contains('dark')) {
        icon.setAttribute('data-lucide', 'sun');
    } else {
        icon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    const t = translations[currentLang];

    if (currentUser.role === 'admin') {
        nav.innerHTML = `
            <button onclick="switchTab('home')" id="nav-home" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 transition">
                <i data-lucide="home" class="w-4 h-4"></i> ${t.home}
            </button>
            <button onclick="switchTab('upload')" id="nav-upload" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="cloud-upload" class="w-4 h-4"></i> ${t.upload}
            </button>
            <button onclick="switchTab('manage-books')" id="nav-manage-books" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="file-edit" class="w-4 h-4"></i> ${t.manage}
            </button>
            <button onclick="switchTab('users')" id="nav-users" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="users" class="w-4 h-4"></i> ${t.users}
            </button>
            <button onclick="switchTab('setting')" id="nav-setting" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="settings" class="w-4 h-4"></i> ${t.settings}
            </button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="switchTab('home')" id="nav-home" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 transition">
                <i data-lucide="home" class="w-4 h-4"></i> ${t.home}
            </button>
            <button onclick="switchTab('favorite')" id="nav-favorite" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="star" class="w-4 h-4"></i> ${t.favorite}
            </button>
            <button onclick="switchTab('borrowed')" id="nav-borrowed" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="clock" class="w-4 h-4"></i> ${t.borrowed}
            </button>
            <button onclick="switchTab('setting')" id="nav-setting" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                <i data-lucide="settings" class="w-4 h-4"></i> ${t.settings}
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
    const tabs = ['home', 'upload', 'manage-books', 'users', 'favorite', 'borrowed', 'setting', 'book-detail'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.add('hidden');
        const nav = document.getElementById(`nav-${t}`);
        if (nav) {
            nav.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-indigo-600', 'text-white', 'shadow-lg');
            nav.classList.add('text-slate-400');
        }
    });

    document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-400');
        activeNav.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-indigo-600', 'text-white', 'shadow-lg', 'shadow-purple-600/30');
    }

    if (tabName === 'favorite') fetchFavorites();
    if (tabName === 'borrowed') fetchBorrowedBooks();
}

async function fetchBooks() {
    try {
        const res = await fetch(`${API_URL}/api/books`);
        const books = await res.json();
        allBooksCache = books || [];
        
        const grid = document.getElementById('booksGrid');
        if (grid) {
            grid.innerHTML = '';
            if (!allBooksCache.length) {
                grid.innerHTML = `<p class="text-slate-400 text-sm col-span-full">هیچ کتێبێک نەدۆزراوەتەوە.</p>`;
                return;
            }

            const uniqueBooksMap = new Map();
            allBooksCache.forEach(b => {
                const titleKey = b.title.trim().toLowerCase();
                if (!uniqueBooksMap.has(titleKey)) uniqueBooksMap.set(titleKey, b);
            });

            const favs = JSON.parse(localStorage.getItem('favorites')) || [];

            uniqueBooksMap.forEach(b => {
                const bookId = b._id || b.id;
                const totalParts = allBooksCache.filter(item => item.title.trim().toLowerCase() === b.title.trim().toLowerCase()).length;
                const isFav = favs.includes(bookId);
                const isMalzam = b.resourceType === 'malzam';

                grid.innerHTML += `
                    <div class="bg-[#161f33] rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl relative">
                        <div onclick="openBookDetails('${b.title.replace(/'/g, "\\'")}')" class="h-48 bg-slate-900 flex items-center justify-center overflow-hidden relative cursor-pointer">
                            ${b.coverUrl ? `<img src="${b.coverUrl}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`}
                            <span class="absolute bottom-2 left-2 bg-black/70 text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold backdrop-blur-sm">
                                ${totalParts} بەش
                            </span>
                            <span class="absolute top-2 left-2 ${isMalzam ? 'bg-emerald-600/80 text-emerald-200' : 'bg-purple-600/80 text-purple-200'} px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                                ${isMalzam ? 'مەلزەمە (بێ کات)' : 'کتێب (قەرز)'}
                            </span>
                        </div>
                        <button onclick="toggleFavorite('${bookId}')" class="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full ${isFav ? 'text-amber-400' : 'text-slate-400'} hover:scale-110 transition z-10">
                            <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-amber-400' : ''}"></i>
                        </button>
                        <div class="p-4 space-y-2">
                            <span class="bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">${b.category || 'General'}</span>
                            <h4 onclick="openBookDetails('${b.title.replace(/'/g, "\\'")}')" class="font-bold text-white text-base leading-snug cursor-pointer hover:text-purple-400">${b.title}</h4>
                            <p class="text-xs text-slate-400">By: ${b.author}</p>
                            <button onclick="openBookDetails('${b.title.replace(/'/g, "\\'")}')" class="block text-center mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2.5 rounded-xl font-medium transition shadow-lg shadow-purple-600/20">
                                بینینی بەشەکان (${totalParts})
                            </button>
                        </div>
                    </div>
                `;
            });
            lucide.createIcons();
        }
    } catch (err) { console.error(err); }
}

function openBookDetails(bookTitle) {
    switchTab('book-detail');
    const matchedBooks = allBooksCache.filter(b => b.title.trim().toLowerCase() === bookTitle.trim().toLowerCase());
    const sampleBook = matchedBooks[0] || {};
    const t = translations[currentLang];

    document.getElementById('detailBookTitle').innerText = sampleBook.title || bookTitle;
    document.getElementById('detailBookAuthor').innerText = `By: ${sampleBook.author || 'Unknown'}`;
    
    const coverDiv = document.getElementById('detailBookCover');
    if (sampleBook.coverUrl && sampleBook.coverUrl !== 'undefined') {
        coverDiv.innerHTML = `<img src="${sampleBook.coverUrl}" class="w-full h-full object-cover">`;
    } else {
        coverDiv.innerHTML = `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`;
    }

    const partsGrid = document.getElementById('bookPartsGrid');
    partsGrid.innerHTML = '';

    if (!matchedBooks.length) {
        partsGrid.innerHTML = `<p class="text-slate-400 text-sm col-span-full">هیچ بەشێک نەدۆزراوەتەوە.</p>`;
        return;
    }

    const isMalzam = sampleBook.resourceType === 'malzam';
    let borrowedList = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    const bookId = sampleBook._id || sampleBook.id;
    const existingBorrow = borrowedList.find(item => item.bookId === bookId);

    if (isMalzam) {
        // مەلزەمە بێ کات و خۆڕاییە
        matchedBooks.forEach((part, index) => {
            const partLabel = part.partName && part.partName !== 'General' ? part.partName : `بەشی ${index + 1}`;
            partsGrid.innerHTML += `
                <a href="${part.fileUrl}" target="_blank" class="bg-[#111827] hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition shadow-lg group space-y-2">
                    <i data-lucide="file-text" class="w-8 h-8 text-emerald-400 group-hover:scale-110 transition"></i>
                    <span class="text-base font-bold text-slate-200 group-hover:text-emerald-400 text-center">${partLabel}</span>
                    <span class="text-[10px] text-emerald-400 font-semibold">${t.freeMalzam}</span>
                </a>
            `;
        });
    } else {
        // کتێب پێویستی بە قەرزکردنە
        if (!existingBorrow) {
            partsGrid.innerHTML = `
                <div class="col-span-full bg-[#111827] border border-slate-800 p-6 rounded-3xl text-center space-y-4">
                    <p class="text-sm text-slate-300">ئەم کتێبە پێویستی بە قەرزکردن هەیە (ماوەکەی ٧ ڕۆژە).</p>
                    <button onclick="borrowBook('${bookId}', '${sampleBook.title.replace(/'/g, "\\'")}')" class="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-600/30">
                        ${t.borrowBtn}
                    </button>
                </div>
            `;
        } else {
            const now = new Date().getTime();
            const expiryTime = existingBorrow.expiryTime;
            const isExpired = now > expiryTime;

            if (isExpired) {
                partsGrid.innerHTML = `
                    <div class="col-span-full bg-red-950/40 border border-red-900/50 p-6 rounded-3xl text-center space-y-2">
                        <i data-lucide="lock" class="w-10 h-10 text-red-400 mx-auto"></i>
                        <h4 class="text-red-300 font-bold text-base">${t.expired}</h4>
                        <p class="text-xs text-slate-400">ماوەی قەرزکردنەکە کۆتایی هات و فایلی کتێبەکە قفڵ کرا.</p>
                    </div>
                `;
            } else {
                const remainingDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
                matchedBooks.forEach((part, index) => {
                    const partLabel = part.partName && part.partName !== 'General' ? part.partName : `بەشی ${index + 1}`;
                    partsGrid.innerHTML += `
                        <a href="${part.fileUrl}" target="_blank" class="bg-[#111827] hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition shadow-lg group space-y-2">
                            <i data-lucide="book-open" class="w-8 h-8 text-purple-400 group-hover:scale-110 transition"></i>
                            <span class="text-base font-bold text-slate-200 group-hover:text-purple-400 text-center">${partLabel}</span>
                            <span class="text-[10px] text-amber-400">${t.borrowedActive} ${remainingDays} ڕۆژ)</span>
                        </a>
                    `;
                });
            }
        }
    }
    lucide.createIcons();
}

function borrowBook(bookId, title) {
    let borrowedList = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    // ماوەی ٧ ڕۆژ
    const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
    borrowedList.push({ bookId, title, expiryTime });
    localStorage.setItem('borrowedBooks', JSON.stringify(borrowedList));
    alert('کتێبەکە بە سەرکەوتوویی قەرزکرا بۆ ماوەی ٧ ڕۆژ!');
    openBookDetails(title);
}

function toggleFavorite(id) {
    let favs = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favs.includes(id)) {
        favs = favs.filter(fav => fav !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    fetchBooks();
    if (document.getElementById('tab-favorite') && !document.getElementById('tab-favorite').classList.contains('hidden')) {
        fetchFavorites();
    }
}

function fetchFavorites() {
    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    const grid = document.getElementById('favoriteBooksGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const favBooks = allBooksCache.filter(b => favs.includes(b._id || b.id));
    if (!favBooks.length) {
        grid.innerHTML = `<p class="text-slate-400 text-sm col-span-full">هیچ کتێبێکی دڵخواز نییە.</p>`;
        return;
    }

    const uniqueFavs = new Map();
    favBooks.forEach(b => {
        const titleKey = b.title.trim().toLowerCase();
        if (!uniqueFavs.has(titleKey)) uniqueFavs.set(titleKey, b);
    });

    uniqueFavs.forEach(b => {
        const bookId = b._id || b.id;
        grid.innerHTML += `
            <div class="bg-[#161f33] rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl relative">
                <div onclick="openBookDetails('${b.title.replace(/'/g, "\\'")}')" class="h-48 bg-slate-900 flex items-center justify-center overflow-hidden relative cursor-pointer">
                    ${b.coverUrl ? `<img src="${b.coverUrl}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-12 h-12 text-slate-600"></i>`}
                </div>
                <button onclick="toggleFavorite('${bookId}')" class="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-amber-400 hover:scale-110 transition z-10">
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
                </button>
                <div class="p-4 space-y-2">
                    <h4 onclick="openBookDetails('${b.title.replace(/'/g, "\\'")}')" class="font-bold text-white text-base leading-snug cursor-pointer hover:text-purple-400">${b.title}</h4>
                    <p class="text-xs text-slate-400">By: ${b.author}</p>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

function fetchBorrowedBooks() {
    const borrowedList = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    const grid = document.getElementById('borrowedBooksGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!borrowedList.length) {
        grid.innerHTML = `<p class="text-slate-400 text-sm col-span-full">هیچ کتێبێکی قەرزکراو نییە.</p>`;
        return;
    }

    borrowedList.forEach(item => {
        const now = new Date().getTime();
        const isExpired = now > item.expiryTime;
        const remainingDays = Math.max(0, Math.ceil((item.expiryTime - now) / (1000 * 60 * 60 * 24)));

        grid.innerHTML += `
            <div class="bg-[#161f33] rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                <h4 class="font-bold text-white text-base">${item.title}</h4>
                <p class="text-xs ${isExpired ? 'text-red-400 font-bold' : 'text-amber-400'}">
                    ${isExpired ? 'ماوەکەی تەواو بووە و قفڵە' : `ماوەی ماوە: ${remainingDays} ڕۆژ`}
                </p>
            </div>
        `;
    });
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
                    <div class="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <h4 class="font-bold text-white text-sm">${b.title} <span class="text-amber-400 text-xs">(${b.partName || ''})</span></h4>
                            <p class="text-xs text-slate-400">${b.author} | ${b.category}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="deleteBook('${id}')" class="bg-red-600/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold">سڕینەوە</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

async function deleteBook(id) {
    if (!confirm('دڵنیایت؟')) return;
    try {
        await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
        fetchBooks();
        fetchManageBooks();
    } catch (err) { console.error(err); }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
}