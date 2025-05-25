// Main JavaScript functionality for Tarcan app

// DOM elements
const splashScreen = document.getElementById('splash-screen');
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const mainScreen = document.getElementById('main-screen');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const goToLogin = document.getElementById('go-to-login');
const goToRegister = document.getElementById('go-to-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabs = document.querySelectorAll('.tab');
const tabPanes = document.querySelectorAll('.tab-pane');
const userName = document.getElementById('user-name');
const sidebarUserName = document.getElementById('sidebar-user-name');
const profileName = document.getElementById('profile-name');
const navItems = document.querySelectorAll('.nav-item');
const addCircle = document.querySelector('.add-circle');
const menuToggleBtn = document.getElementById('menu-toggle');
const sidebarMenu = document.getElementById('sidebar-menu');
const closeMenuBtn = document.getElementById('close-menu');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
const logoutBtn = document.getElementById('logout-btn');

// Page elements
const pages = document.querySelectorAll('.page');

// Locale data for multi-language support
const locale = {
    tr: {
        login: "Giriş Yap",
        register: "Kayıt Ol",
        welcome: "Çiftçilik Yönetimi ve Planlama Uygulaması",
        addField: "Tarla Ekle",
        addTask: "Görev Ekle",
        reports: "Raporlar",
        calendar: "Takvim",
        profile: "Profil",
        settings: "Ayarlar",
        logout: "Çıkış Yap",
    },
    en: {
        login: "Login",
        register: "Register",
        welcome: "Farm Management and Planning Application",
        addField: "Add Field",
        addTask: "Add Task",
        reports: "Reports",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
    },
};

// Current language
let currentLang = "tr";

// Function to switch language
function switchLanguage(lang) {
    currentLang = lang;
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.dataset.i18n;
        el.textContent = locale[lang][key];
    });
}

// Initialize the app
function initApp() {
    // Add event listeners
    loginBtn.addEventListener('click', () => showScreen(loginScreen));
    registerBtn.addEventListener('click', () => showScreen(registerScreen));
    goToLogin.addEventListener('click', () => showScreen(loginScreen));
    goToRegister.addEventListener('click', () => showScreen(registerScreen));
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Sidebar menu listeners
    menuToggleBtn.addEventListener('click', toggleSidebar);
    closeMenuBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Sidebar item click listeners
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.id === 'logout-btn') {
                handleLogout();
                return;
            }
            
            const pageName = item.dataset.page;
            if (pageName) {
                switchPage(pageName);
                closeSidebar();
            }
        });
    });
    
    // Bottom navigation listeners
    bottomNavItems.forEach(item => {
        if (item.classList.contains('add-nav-item')) {
            item.addEventListener('click', showAddMenu);
        } else {
            item.addEventListener('click', () => {
                const pageName = item.dataset.page;
                if (pageName) {
                    switchPage(pageName);
                    updateNavActive(item);
                }
            });
        }
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Initialize animation for logo
    document.querySelector('.logo svg').addEventListener('mouseenter', function() {
        this.style.transform = 'rotate(5deg)';
    });
    
    document.querySelector('.logo svg').addEventListener('mouseleave', function() {
        this.style.transform = 'rotate(0deg)';
    });
    
    // Auto-transition from splash to login after delay
    setTimeout(() => showScreen(loginScreen), 4000);
    
    // Initialize weather data
    fetchWeatherData();
    
    // Add loading simulation
    simulateLoading();

    // Initialize language on page load
    switchLanguage(currentLang);

    // Add event listener for language selection
    const languageSelect = document.querySelector(".language-select");
    if (languageSelect) {
        languageSelect.addEventListener("change", (e) => {
            switchLanguage(e.target.value);
        });
    }
}

// Toggle sidebar menu with animation
function toggleSidebar() {
    sidebarMenu.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebarMenu.classList.contains('active') ? 'hidden' : '';
    
    // Add animation to menu items
    const menuItems = sidebarMenu.querySelectorAll('.sidebar-item');
    menuItems.forEach((item, index) => {
        item.style.animation = sidebarMenu.classList.contains('active') 
            ? `slideInRight 0.3s ease forwards ${0.1 + index * 0.05}s` 
            : 'none';
    });
}

// Close sidebar menu
function closeSidebar() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Switch between pages
function switchPage(pageName) {
    pages.forEach(page => {
        if (page.id === `${pageName}-page`) {
            page.classList.add('active-page');
        } else {
            page.classList.remove('active-page');
        }
    });
}

// Update active state in bottom navigation
function updateNavActive(activeItem) {
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

// Handle logout
function handleLogout() {
    closeSidebar();
    showScreen(loginScreen);
}

// Show a specific screen with improved animation
function showScreen(screen) {
    // Show loading overlay first
    document.getElementById('loading-overlay').classList.remove('hide');
    
    setTimeout(() => {
        // Hide all screens with transition
        splashScreen.classList.remove('active');
        loginScreen.classList.remove('active');
        registerScreen.classList.remove('active');
        mainScreen.classList.remove('active');
        
        // Add animation class based on screen type
        let animationClass = '';
        if (screen === mainScreen) {
            animationClass = 'slideInUp';
        } else if (screen === loginScreen || screen === registerScreen) {
            animationClass = 'fadeIn';
        } else {
            animationClass = 'zoomIn';
        }
        
        // Show the selected screen with animation
        screen.classList.add('active');
        screen.classList.add(`animate__${animationClass}`);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            screen.classList.remove(`animate__${animationClass}`);
        }, 1000);
        
        // If main screen, reset to dashboard
        if (screen === mainScreen) {
            switchPage('dashboard');
            updateNavActive(document.querySelector('.nav-item[data-page="dashboard"]'));
        }
        
        // Hide loading overlay
        document.getElementById('loading-overlay').classList.add('hide');
    }, 500);
}

// Simulate loading for demo
function simulateLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hide');
    
    setTimeout(() => {
        loadingOverlay.classList.add('hide');
    }, 1500);
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    
    // In a real app, this would validate credentials against a backend
    console.log('Login attempt with:', { phone, password });
    
    // For demo purposes, just proceed to main screen
    const name = 'Demo Çiftçi';
    userName.textContent = name;
    sidebarUserName.textContent = name;
    profileName.textContent = name;
    showScreen(mainScreen);
}

// Add validation for login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const phone = document.getElementById('login-phone').value.trim();
    const name = document.getElementById('login-name') ? document.getElementById('login-name').value.trim() : '';

    if (!phone || !name) {
        alert('Lütfen hem isim hem de telefon numarasını girin.');
        return;
    }

    // Proceed with login logic
    console.log('Login successful:', { name, phone });
    showScreen(mainScreen);
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // ...existing login logic...
    window.location.href = 'anasayfa.html'; // Redirect to the main page after login
});

document.getElementById('girisBtn').addEventListener('click', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm.style.display === 'none' || loginForm.style.display === '') {
        loginForm.style.display = 'block';
        return; // İlk tıklamada sadece formu aç
    }

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Lütfen tüm alanları doldurun!');
    } else {
        alert('Giriş başarılı!');
        window.location.href = 'dashboard.html';
    }
});

document.getElementById('kayitBtn').addEventListener('click', function () {
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    if (name && phone && password) {
        // Simulate successful registration
        alert('Kayıt başarılı!');
        window.location.href = 'anasayfa.html';
    } else {
        alert('Lütfen tüm alanları doldurun!');
    }
});

document.getElementById('girisBtn').addEventListener('click', function () {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;

    if (!phone || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    // Simulate login success
    localStorage.setItem('user', JSON.stringify({ phone }));
    alert('Giriş başarılı!');
    window.location.href = 'dashboard.html';
});

document.getElementById('kayitBtn').addEventListener('click', function () {
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    if (!name || !phone || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    // Simulate registration success
    localStorage.setItem('user', JSON.stringify({ name, phone }));
    alert('Kayıt başarılı!');
    window.location.href = 'dashboard.html';
});

// Handle registration form submission
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    
    // In a real app, this would send registration data to a backend
    console.log('Registration with:', { name, phone, password });
    
    // For demo purposes, just proceed to main screen
    userName.textContent = name;
    sidebarUserName.textContent = name;
    profileName.textContent = name;
    showScreen(mainScreen);
}

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // ...existing register logic...
    window.location.href = 'anasayfa.html'; // Redirect to the main page after registration
});

// Switch between tabs
function switchTab(tabId) {
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    tabPanes.forEach(pane => {
        if (pane.id === `${tabId}-tab`) {
            pane.style.display = 'block';
            setTimeout(() => {
                pane.classList.add('active');
                pane.style.opacity = '1';
                pane.style.transform = 'translateX(0)';
            }, 50);
        } else {
            pane.classList.remove('active');
            pane.style.opacity = '0';
            pane.style.transform = 'translateX(20px)';
            setTimeout(() => {
                if (!pane.classList.contains('active')) {
                    pane.style.display = 'none';
                }
            }, 300);
        }
    });
}

// Show add menu with animation for adding fields, crops, or events
function showAddMenu() {
    // Get current active page
    const activePage = document.querySelector('.page.active-page').id.replace('-page', '');
    
    let actionType = 'Öğe';
    if (activePage === 'products') actionType = 'Ürün';
    else if (activePage === 'calendar') actionType = 'Görev';
    else if (activePage === 'dashboard') actionType = 'Tarla';
    
    // Create and show a modal instead of alert
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate__animated animate__fadeIn';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content animate__animated animate__zoomIn';
    modalContent.innerHTML = `
        <h3>Yeni ${actionType} Ekle</h3>
        <div class="form-fields">
            <div class="input-group">
                <label>İsim</label>
                <input type="text" placeholder="${actionType} ismi girin">
            </div>
            <div class="input-group">
                <label>Tarih</label>
                <input type="date">
            </div>
            <div class="input-group">
                <label>Açıklama</label>
                <textarea placeholder="Açıklama girin"></textarea>
            </div>
        </div>
        <div class="modal-actions">
            <button class="secondary-btn modal-cancel">İptal</button>
            <button class="primary-btn modal-save">Kaydet</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    modal.querySelector('.modal-cancel').addEventListener('click', () => {
        modalContent.classList.replace('animate__zoomIn', 'animate__zoomOut');
        modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    modal.querySelector('.modal-save').addEventListener('click', () => {
        // Here would go the save logic in a real app
        modalContent.classList.replace('animate__zoomIn', 'animate__zoomOut');
        modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => {
            document.body.removeChild(modal);
            // Show success message
            showNotification(`Yeni ${actionType} başarıyla eklendi!`);
        }, 300);
    });
}

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate__animated animate__slideInUp`;
    notification.innerHTML = `
        <span class="material-icons">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Show product details function
function showProductDetails(productName, fieldName, plantDate, harvestDate, progress) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay product-detail animate__animated animate__fadeIn';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content animate__animated animate__slideInUp';
    modalContent.innerHTML = `
        <div class="product-detail-header">
            <h3>${productName}</h3>
            <span class="material-icons modal-close">close</span>
        </div>
        <div class="product-detail-content">
            <div class="product-detail-image">
                <svg viewBox="0 0 100 100" width="100" height="100">
                    <circle cx="50" cy="50" r="40" fill="#8bc34a" />
                    ${productName === 'Buğday' ? '<circle cx="50" cy="50" r="20" fill="#795548" />' : 
                      productName === 'Mısır' ? '<rect x="30" y="20" width="40" height="60" fill="#ffeb3b" /><path d="M30,20 C50,40 50,40 70,20" fill="#4caf50" />' : 
                      '<circle cx="50" cy="75" r="20" fill="#e53935" /><path d="M50,20 C30,50 70,50 50,20" fill="#4caf50" />'}
                </svg>
            </div>
            <div class="detail-info-group">
                <label>Tarla</label>
                <div>${fieldName}</div>
            </div>
            <div class="detail-info-group">
                <label>Ekim Tarihi</label>
                <div>${plantDate}</div>
            </div>
            <div class="detail-info-group">
                <label>Hasat Tarihi</label>
                <div>${harvestDate}</div>
            </div>
            <div class="detail-info-group">
                <label>İlerleme</label>
                <div class="progress-bar detail-progress">
                    <div class="progress" style="width: ${progress}%"></div>
                    <span>%${progress}</span>
                </div>
            </div>
            <div class="detail-info-group">
                <label>Notlar</label>
                <div class="detail-notes">Ürün sağlıklı bir şekilde büyüyor. Son sulama 2 gün önce yapıldı.</div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="action-btn edit-btn">
                <span class="material-icons">edit</span>
                Düzenle
            </button>
            <button class="action-btn delete-btn">
                <span class="material-icons">delete</span>
                Sil
            </button>
            <button class="action-btn favorite-btn">
                <span class="material-icons">favorite_border</span>
                Favorilere Ekle
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modalContent.classList.replace('animate__slideInUp', 'animate__slideOutDown');
        modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Add event listeners for action buttons
    modal.querySelector('.favorite-btn').addEventListener('click', function() {
        const icon = this.querySelector('.material-icons');
        if (icon.textContent === 'favorite_border') {
            icon.textContent = 'favorite';
            this.classList.add('active');
            showNotification(`${productName} favorilere eklendi`);
        } else {
            icon.textContent = 'favorite_border';
            this.classList.remove('active');
            showNotification(`${productName} favorilerden çıkarıldı`);
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Add click handlers for products
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productName = this.querySelector('h3').textContent;
            const fieldName = this.querySelector('p').textContent;
            const plantDate = this.querySelector('.product-dates div:first-child').textContent.replace('Ekim: ', '');
            const harvestDate = this.querySelector('.product-dates div:last-child').textContent.replace('Hasat: ', '');
            const progress = this.querySelector('.progress').style.width.replace('%', '');
            
            showProductDetails(productName, fieldName, plantDate, harvestDate, progress);
        });
    });
    
    // Add click handlers for calendar events
    const calendarDays = document.querySelectorAll('.calendar-day:not(.day-header)');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            if (this.classList.contains('event-day')) {
                const dayNum = this.textContent;
                showEventDetails(dayNum);
            }
        });
    });
});

// Show event details
function showEventDetails(day) {
    const events = [
        { day: '4', title: 'Sulama - Merkez Tarla', time: '08:00', crop: 'Buğday' },
        { day: '7', title: 'İlaçlama - Doğu Tarla', time: '16:00', crop: 'Mısır' },
        { day: '13', title: 'Gübreleme - Merkez Tarla', time: '09:00', crop: 'Buğday' }
    ];
    
    const event = events.find(e => e.day === day);
    if (!event) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay event-detail animate__animated animate__fadeIn';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content animate__animated animate__slideInUp';
    modalContent.innerHTML = `
        <div class="event-detail-header">
            <div class="event-date-large">
                <div class="event-day-large">${event.day}</div>
                <div class="event-month-large">Temmuz</div>
            </div>
            <h3>${event.title}</h3>
            <span class="material-icons modal-close">close</span>
        </div>
        <div class="event-detail-content">
            <div class="detail-info-group">
                <label>Saat</label>
                <div>${event.time}</div>
            </div>
            <div class="detail-info-group">
                <label>Ürün</label>
                <div>${event.crop}</div>
            </div>
            <div class="detail-info-group">
                <label>Notlar</label>
                <div class="detail-notes">Bu görev düzenli olarak yapılmalıdır. Son ${event.title.split(' - ')[0].toLowerCase()} işlemi 1 hafta önce yapıldı.</div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="action-btn edit-btn">
                <span class="material-icons">edit</span>
                Düzenle
            </button>
            <button class="action-btn delete-btn">
                <span class="material-icons">delete</span>
                Sil
            </button>
            <button class="action-btn complete-btn">
                <span class="material-icons">check_circle</span>
                Tamamlandı
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modalContent.classList.replace('animate__slideInUp', 'animate__slideOutDown');
        modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Complete button event listener
    modal.querySelector('.complete-btn').addEventListener('click', function() {
        this.classList.add('active');
        this.querySelector('.material-icons').textContent = 'check_circle';
        showNotification(`${event.title} görevi tamamlandı olarak işaretlendi`);
        
        setTimeout(() => {
            modalContent.classList.replace('animate__slideInUp', 'animate__slideOutDown');
            modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }, 1000);
    });
}

// Mock weather API data with improved visualization
function fetchWeatherData() {
    // In a real app, this would fetch from a weather API
    console.log('Fetching weather data');
    
    // Animate weather icon for demo
    const weatherIcon = document.querySelector('.weather-icon svg');
    if (weatherIcon) {
        weatherIcon.style.animation = 'pulse 2s infinite';
    }
    
    // Mock geolocation for demo
    if (navigator.geolocation) {
        console.log("Geolocation is available");
        // In a real app, we would actually use the location
    }
}

// Initialize database connection
const room = new WebsimSocket();

// Collection types
const COLLECTIONS = {
    REMINDER: 'reminder',
    FIELD_OPERATION: 'field_operation',
    FIELD: 'field'
};

// Quick access menu functionality
document.querySelectorAll('.quick-item').forEach(item => {
    item.addEventListener('click', () => {
        const action = item.dataset.action;
        handleQuickAction(action);
    });
});

// Expandable panel functionality
document.querySelector('.panel-header').addEventListener('click', function () {
    this.classList.toggle('expanded');
    const content = this.nextElementSibling;
    content.classList.toggle('expanded');
});

// Add reminder functionality
document.querySelector('.add-reminder-btn').addEventListener('click', () => {
    showAddReminderModal();
});

// Add field operation functionality
document.querySelector('.add-operation-btn').addEventListener('click', () => {
    showAddOperationModal();
});

async function handleQuickAction(action) {
    switch(action) {
        case 'add-field':
            showAddFieldModal();
            break;
        case 'add-task':
            showAddReminderModal();
            break;
        case 'reports':
            switchPage('reports');
            break;
        case 'calendar':
            switchPage('calendar');
            break;
    }
}

function showAddReminderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate__animated animate__fadeIn';
    
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h3>Yeni Hatırlatma Ekle</h3>
            <form id="reminder-form">
                <div class="form-fields">
                    <div class="input-group">
                        <label>Başlık</label>
                        <input type="text" name="title" required>
                    </div>
                    <div class="input-group">
                        <label>Tarih</label>
                        <input type="datetime-local" name="date" required>
                    </div>
                    <div class="input-group">
                        <label>Açıklama</label>
                        <textarea name="description"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn modal-cancel">İptal</button>
                    <button type="submit" class="primary-btn">Kaydet</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#reminder-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            await room.collection(COLLECTIONS.REMINDER).create({
                title: formData.get('title'),
                date: formData.get('date'),
                description: formData.get('description'),
                completed: false
            });
            
            showNotification('Hatırlatma başarıyla eklendi');
            closeModal(modal);
            loadReminders();
        } catch (error) {
            showNotification('Hatırlatma eklenirken bir hata oluştu', 'error');
        }
    });
    
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(modal));
}

async function loadReminders() {
    const reminderList = document.querySelector('.reminder-list');
    const reminders = await room.collection(COLLECTIONS.REMINDER)
        .filter({ completed: false })
        .getList();
    
    reminderList.innerHTML = reminders.map(reminder => `
        <div class="reminder-item" data-id="${reminder.id}">
            <div class="checkbox ${reminder.completed ? 'checked' : ''}"
                 onclick="toggleReminder('${reminder.id}', ${reminder.completed})"></div>
            <div class="reminder-content">
                <h4>${reminder.title}</h4>
                <p>${new Date(reminder.date).toLocaleString()}</p>
                ${reminder.description ? `<p>${reminder.description}</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function toggleReminder(id, completed) {
    try {
        await room.collection(COLLECTIONS.REMINDER).update(id, {
            completed: !completed
        });
        loadReminders();
    } catch (error) {
        showNotification('Hatırlatma güncellenirken bir hata oluştu', 'error');
    }
}

function closeModal(modal) {
    modal.querySelector('.modal-content').classList.replace('animate__zoomIn', 'animate__zoomOut');
    modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
    setTimeout(() => modal.remove(), 300);
}

// Initial load
loadReminders();

// Subscribe to reminder updates
room.collection(COLLECTIONS.REMINDER).subscribe(() => {
    loadReminders();
});

document.querySelectorAll('.quick-card').forEach(card => {
    card.addEventListener('click', () => {
        const action = card.querySelector('span').textContent.trim();
        switch (action) {
            case 'Yeni Ürün':
                showScreen(document.getElementById('products-page'));
                break;
            case 'Görevler':
                showScreen(document.getElementById('calendar-page'));
                break;
            case 'Raporlar':
                alert('Raporlar sayfası henüz hazır değil.');
                break;
            case 'Harita':
                alert('Harita özelliği henüz eklenmedi.');
                break;
        }
    });
});

document.querySelector('.add-reminder-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate__animated animate__fadeIn';
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h3>Yeni Görev Ekle</h3>
            <form id="task-form">
                <div class="form-fields">
                    <div class="input-group">
                        <label>Başlık</label>
                        <input type="text" name="title" required>
                    </div>
                    <div class="input-group">
                        <label>Tarih</label>
                        <input type="datetime-local" name="date" required>
                    </div>
                    <div class="input-group">
                        <label>Açıklama</label>
                        <textarea name="description"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn modal-cancel">İptal</button>
                    <button type="submit" class="primary-btn">Kaydet</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Görev başarıyla eklendi!');
        modal.remove();
    });
});

document.querySelector('.add-operation-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate__animated animate__fadeIn';
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h3>Yeni İşlem Ekle</h3>
            <form id="operation-form">
                <div class="form-fields">
                    <div class="input-group">
                        <label>İşlem Türü</label>
                        <select name="type" required>
                            <option value="İlaçlama">İlaçlama</option>
                            <option value="Gübreleme">Gübreleme</option>
                            <option value="Sulama">Sulama</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Tarih</label>
                        <input type="date" name="date" required>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn modal-cancel">İptal</button>
                    <button type="submit" class="primary-btn">Kaydet</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#operation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('İşlem başarıyla eklendi!');
        modal.remove();
    });
});

// Function to handle profile editing
function handleProfileEdit() {
    const profileNameInput = document.getElementById('profile-name-input');
    const profilePhoneInput = document.getElementById('profile-phone-input');
    const profileEmailInput = document.getElementById('profile-email-input');
    const profileAddressInput = document.getElementById('profile-address-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    saveProfileBtn.addEventListener('click', () => {
        const name = profileNameInput.value.trim();
        const phone = profilePhoneInput.value.trim();
        const email = profileEmailInput.value.trim();
        const address = profileAddressInput.value.trim();

        if (name && phone && email && address) {
            // Update profile information
            document.getElementById('profile-name').textContent = name;
            document.querySelector('.info-value[data-field="phone"]').textContent = phone;
            document.querySelector('.info-value[data-field="email"]').textContent = email;
            document.querySelector('.info-value[data-field="address"]').textContent = address;

            // Show success notification
            showNotification('Profil bilgileri başarıyla güncellendi');
        } else {
            showNotification('Lütfen tüm alanları doldurun', 'error');
        }
    });
}

// Function to handle settings changes
function handleSettings() {
    const notificationToggle = document.querySelector('.switch input[name="notifications"]');
    const darkModeToggle = document.querySelector('.switch input[name="dark-mode"]');

    notificationToggle.addEventListener('change', () => {
        const status = notificationToggle.checked ? 'açık' : 'kapalı';
        showNotification(`Bildirimler ${status} olarak ayarlandı`);
    });

    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        const mode = darkModeToggle.checked ? 'Karanlık Mod' : 'Aydınlık Mod';
        showNotification(`${mode} etkinleştirildi`);
    });
}

// Function to handle notification settings
function handleNotificationSettings() {
    const notificationSettings = {
        reminders: true,
        updates: true,
        promotions: false,
    };

    const notificationCheckboxes = document.querySelectorAll('.notification-setting input');
    notificationCheckboxes.forEach((checkbox) => {
        checkbox.checked = notificationSettings[checkbox.name];
        checkbox.addEventListener('change', () => {
            notificationSettings[checkbox.name] = checkbox.checked;
            showNotification(
                `${checkbox.dataset.label} bildirimleri ${checkbox.checked ? 'açık' : 'kapalı'} olarak ayarlandı`
            );
        });
    });
}

const notificationSettingsKey = 'notificationSettings';

function saveNotificationSettings() {
    const settings = {};
    document.querySelectorAll('.notification-setting input').forEach(input => {
        settings[input.name] = input.checked;
    });
    localStorage.setItem(notificationSettingsKey, JSON.stringify(settings));
    alert('Bildirim ayarları kaydedildi!');
}

function loadNotificationSettings() {
    const savedSettings = JSON.parse(localStorage.getItem(notificationSettingsKey));
    if (savedSettings) {
        document.querySelectorAll('.notification-setting input').forEach(input => {
            input.checked = savedSettings[input.name] || false;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotificationSettings();

    document.querySelectorAll('.notification-setting input').forEach(input => {
        input.addEventListener('change', saveNotificationSettings);
    });
});

// Initialize profile and settings functionality
document.addEventListener('DOMContentLoaded', () => {
    handleProfileEdit();
    handleSettings();
    handleNotificationSettings();
});

// Function to generate a report
function generateReport() {
    const reportModal = document.createElement('div');
    reportModal.className = 'modal-overlay animate__animated animate__fadeIn';

    reportModal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h3>Rapor Oluştur</h3>
            <div class="form-fields">
                <div class="input-group">
                    <label>Rapor Türü</label>
                    <select id="report-type">
                        <option value="field">Tarla Verileri</option>
                        <option value="crop">Ürün Verileri</option>
                        <option value="task">Görev Verileri</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Tarih Aralığı</label>
                    <input type="date" id="start-date"> - <input type="date" id="end-date">
                </div>
            </div>
            <div class="modal-actions">
                <button class="secondary-btn modal-cancel">İptal</button>
                <button class="primary-btn modal-generate">Oluştur</button>
            </div>
        </div>
    `;

    document.body.appendChild(reportModal);

    reportModal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(reportModal));
    reportModal.querySelector('.modal-generate').addEventListener('click', () => {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            showNotification('Lütfen tarih aralığını seçin', 'error');
            return;
        }

        // Simulate report generation
        closeModal(reportModal);
        showNotification(`${reportType} raporu başarıyla oluşturuldu!`);
    });
}

// Initialize report generation functionality
document.addEventListener('DOMContentLoaded', () => {
    const reportButton = document.querySelector('.generate-report-btn');
    if (reportButton) {
        reportButton.addEventListener('click', generateReport);
    }
});

// Function to show field details
function showFieldDetails(fieldName, fieldSize, operations) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay field-detail animate__animated animate__fadeIn';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content animate__animated animate__slideInUp';
    modalContent.innerHTML = `
        <div class="field-detail-header">
            <h3>${fieldName}</h3>
            <span class="material-icons modal-close">close</span>
        </div>
        <div class="field-detail-content">
            <div class="detail-info-group">
                <label>Boyut</label>
                <div>${fieldSize}</div>
            </div>
            <div class="detail-info-group">
                <label>Geçmiş İşlemler</label>
                <div class="operations-history">
                    ${operations.map(op => `
                        <div class="operation-item">
                            <div class="operation-icon">
                                <span class="material-icons">${op.type === 'Sulama' ? 'water_drop' : op.type === 'İlaçlama' ? 'healing' : 'eco'}</span>
                            </div>
                            <div class="operation-content">
                                <h4>${op.type}</h4>
                                <p>${op.date}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listener for closing the modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modalContent.classList.replace('animate__slideInUp', 'animate__slideOutDown');
        modal.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
}

// Initialize field detail functionality
document.addEventListener('DOMContentLoaded', () => {
    const fieldItems = document.querySelectorAll('.field-item');
    fieldItems.forEach(item => {
        item.addEventListener('click', () => {
            const fieldName = item.querySelector('.field-info h4').textContent;
            const fieldSize = item.querySelector('.field-info p').textContent;
            const operations = [
                { type: 'Sulama', date: '01.07.2023' },
                { type: 'İlaçlama', date: '15.06.2023' },
                { type: 'Gübreleme', date: '01.06.2023' }
            ];
            showFieldDetails(fieldName, fieldSize, operations);
        });
    });
});

// Function to switch to the products screen
function goToProductsScreen() {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
    switchPage('products');
}

// Add event listener to a button for navigating to the products screen
const goToProductsBtn = document.getElementById('go-to-products');
if (goToProductsBtn) {
    goToProductsBtn.addEventListener('click', goToProductsScreen);
}

// Modify the registration form submission to navigate to the dashboard
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!name || !phone || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    // Simulate successful registration
    console.log('Registration successful:', { name, phone });

    // Update user name in the UI
    userName.textContent = name;
    sidebarUserName.textContent = name;

    // Navigate to the dashboard screen
    showScreen(mainScreen);
    switchPage('dashboard');
});

// Modify the login form submission to store and display the user's name
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const phone = document.getElementById('login-phone').value.trim();
    const name = document.getElementById('login-name') ? document.getElementById('login-name').value.trim() : '';

    if (!phone || !name) {
        alert('Lütfen hem isim hem de telefon numarasını girin.');
        return;
    }

    // Store the user's name and display it in the UI
    userName.textContent = name;
    sidebarUserName.textContent = name;

    // Proceed to the main screen
    showScreen(mainScreen);
});

// Add theme toggle functionality
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'Karanlık Tema' : 'Aydınlık Tema';
    showNotification(`${theme} etkinleştirildi`);
});

// Function to handle page transitions
function handlePageTransition(tag) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.dataset.tag === tag) {
            page.classList.add('active-page');
        } else {
            page.classList.remove('active-page');
        }
    });
}

// Add event listeners to buttons for page transitions
const buttons = document.querySelectorAll('[data-tag]');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        handlePageTransition(tag);
    });
});

document.querySelectorAll(".tab-btn").forEach(button => {
  button.addEventListener("click", () => {
    const tabId = button.getAttribute("data-tab");

    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach(content => {
      content.style.display = "none";
    });

    // Show the content of the clicked tab
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.style.display = "block";
    }
  });
});

function loadReportsData() {
    const reportsData = [
        { date: '2023-07-01', operation: 'Sulama', detail: 'Merkez Tarla - Buğday' },
        { date: '2023-07-07', operation: 'İlaçlama', detail: 'Doğu Tarla - Mısır' },
        { date: '2023-07-13', operation: 'Gübreleme', detail: 'Merkez Tarla - Buğday' }
    ];

    // Populate table
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = reportsData.map(data => `
        <tr>
            <td>${data.date}</td>
            <td>${data.operation}</td>
            <td>${data.detail}</td>
        </tr>
    `).join('');

    // Prepare data for Chart.js
    const labels = reportsData.map(data => data.date);
    const operations = reportsData.map(data => data.operation);

    // Create chart
    const ctx = document.getElementById('reportsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'İşlem Türleri',
                data: operations.map(op => operations.filter(o => o === op).length),
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load reports data when the Reports Page is shown
document.addEventListener('DOMContentLoaded', () => {
    const reportsPage = document.getElementById('reports-page');
    if (reportsPage) {
        loadReportsData();
    }
});

let map;
let fields = [];

function initializeMap() {
    map = L.map('map').setView([39.92077, 32.85411], 6); // Centered on Turkey

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        const marker = L.marker([lat, lng]).addTo(map);
        fields.push({ lat, lng });
        updateFieldsList();
    });
}

function updateFieldsList() {
    const fieldsListContainer = document.getElementById('fields-list-container');
    fieldsListContainer.innerHTML = fields.map((field, index) => `
        <div class="field-item">
            <div class="field-info">
                <h4>Tarla ${index + 1}</h4>
                <p>Enlem: ${field.lat.toFixed(5)}, Boylam: ${field.lng.toFixed(5)}</p>
            </div>
        </div>
    `).join('');
}

document.getElementById('save-fields-btn').addEventListener('click', function () {
    const fieldsJSON = JSON.stringify(fields, null, 2);
    console.log('Saved Fields:', fieldsJSON);
    alert('Tarlalar JSON formatında kaydedildi!');
});

document.addEventListener('DOMContentLoaded', function () {
    initializeMap();
});

let events = JSON.parse(localStorage.getItem('events')) || [];

function saveEvent(event) {
    event.id = Date.now(); // Assign a unique ID to each event
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
    updateCalendar();
}

function showEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay event-detail animate__animated animate__fadeIn';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content animate__animated animate__slideInUp';
    modalContent.innerHTML = `
        <div class="event-detail-header">
            <h3>${event.title}</h3>
            <span class="material-icons modal-close">close</span>
        </div>
        <div class="event-detail-content">
            <p><strong>Tarih:</strong> ${event.date}</p>
            <p><strong>Açıklama:</strong> ${event.description}</p>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
}

function updateCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day:not(.day-header)');
    calendarDays.forEach(day => {
        const dayNum = day.textContent;
        const eventForDay = events.find(event => event.date === dayNum);
        if (eventForDay) {
            day.classList.add('event-day');
            day.addEventListener('click', () => showEventDetails(eventForDay.id));
        } else {
            day.classList.remove('event-day');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();

    const addEventButton = document.getElementById('add-event-btn');
    if (addEventButton) {
        addEventButton.addEventListener('click', () => {
            const date = document.getElementById('event-date').value;
            const title = prompt('Etkinlik Başlığı:');
            const description = prompt('Etkinlik Açıklaması:');
            if (date && title) {
                saveEvent({ date, title, description });
                alert('Etkinlik başarıyla kaydedildi!');
            } else {
                alert('Lütfen tüm alanları doldurun!');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const quickAccessButtons = document.querySelectorAll('.quick-card');

    quickAccessButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.querySelector('span:last-child').textContent.trim();

            switch (action) {
                case 'Yeni Ürün':
                    switchPage('products');
                    break;
                case 'Görevler':
                    switchPage('calendar');
                    break;
                case 'Raporlar':
                    switchPage('reports');
                    break;
                case 'Harita':
                    switchPage('fields');
                    break;
                default:
                    alert('Bu buton henüz işlevsel değil.');
            }
        });
    });
});

let fieldOperations = JSON.parse(localStorage.getItem('fieldOperations')) || [];

function saveFieldOperation(operation) {
    fieldOperations.push(operation);
    localStorage.setItem('fieldOperations', JSON.stringify(fieldOperations));
    updateFieldOperationsList();
}

function loadFieldOperations() {
    fieldOperations = JSON.parse(localStorage.getItem('fieldOperations')) || [];
    updateFieldOperationsList();
}

function updateFieldOperationsList() {
    const operationsList = document.querySelector('.operations-list');
    operationsList.innerHTML = fieldOperations.map((operation, index) => `
        <div class="operation-item">
            <div class="operation-icon">
                <span class="material-icons">${operation.type === 'Sulama' ? 'water_drop' : operation.type === 'İlaçlama' ? 'healing' : 'eco'}</span>
            </div>
            <div class="operation-content">
                <h4>${operation.type}</h4>
                <p>${operation.date}</p>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadFieldOperations();

    const addOperationButton = document.querySelector('.add-operation-btn');
    if (addOperationButton) {
        addOperationButton.addEventListener('click', () => {
            const type = prompt('İşlem Türü (Sulama, İlaçlama, Gübreleme):');
            const date = prompt('Tarih (YYYY-MM-DD):');
            if (type && date) {
                saveFieldOperation({ type, date });
                alert('İşlem başarıyla kaydedildi!');
            } else {
                alert('Lütfen tüm alanları doldurun!');
            }
        });
    }
});

const products = [
    { name: 'Buğday', field: 'Merkez Tarla', plantDate: '15.03.2023', harvestDate: '01.08.2023', progress: 70, icon: 'https://example.com/icons/wheat.png' },
    { name: 'Mısır', field: 'Doğu Tarla', plantDate: '10.04.2023', harvestDate: '15.09.2023', progress: 40, icon: 'https://example.com/icons/corn.png' },
    { name: 'Domates', field: 'Batı Tarla', plantDate: '20.04.2023', harvestDate: '25.08.2023', progress: 55, icon: 'https://example.com/icons/tomato.png' }
];

function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.icon}" alt="${product.name}" width="60" height="60">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p>${product.field}</p>
                <div class="product-dates">
                    <div><span class="material-icons">calendar_today</span> Ekim: ${product.plantDate}</div>
                    <div><span class="material-icons">event</span> Hasat: ${product.harvestDate}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${product.progress}%"></div>
                    <span>%${product.progress}</span>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('splash-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
});

document.getElementById('register-btn').addEventListener('click', () => {
    document.getElementById('splash-screen').classList.remove('active');
    document.getElementById('register-screen').classList.add('active');
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("girisBtn").addEventListener("click", function () {
        alert("Girişe tıklandı");
    });

    document.getElementById("kayitBtn").addEventListener("click", function () {
        alert("Kayıta tıklandı");
    });

    // ...existing event listeners and logic...
});

document.addEventListener('DOMContentLoaded', function () {
    // Elementleri bir seferde seçelim
    const girisBtn = document.getElementById('girisBtn');
    const loginBtn = document.getElementById('login-btn');
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('login-screen');

    // girisBtn için işlevsellik
    if (girisBtn && loginForm) {
        girisBtn.addEventListener('click', function () {
            // Form görünürlük kontrolü
            if (loginForm.style.display === 'none' || loginForm.style.display === '') {
                loginForm.style.display = 'block';
                return;
            }

            // Validasyon
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                alert('Lütfen tüm alanları doldurun!');
            } else {
                alert('Giriş başarılı!');
                window.location.href = 'dashboard.html';
            }
        });
    } else {
        console.error('girisBtn veya loginForm bulunamadı');
    }

    // loginScreen kontrolü
    if (girisBtn && loginScreen) {
        girisBtn.addEventListener('click', function () {
            loginScreen.style.display = 'block';
        });
    }

    // loginBtn için basit loglama
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Giriş butonuna tıklandı!');
        });
    } else {
        console.error('login-btn bulunamadı!');
    }
});

// Ensure login form is visible when login button is clicked
document.getElementById('girisBtn').addEventListener('click', function () {
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');

    // Hide splash screen and show login screen
    splashScreen.classList.remove('active');
    loginScreen.classList.add('active');
});

// Ensure register form is visible when register button is clicked
document.getElementById('kayitBtn').addEventListener('click', function () {
    const splashScreen = document.getElementById('splash-screen');
    const registerScreen = document.getElementById('register-screen');

    // Hide splash screen and show register screen
    splashScreen.classList.remove('active');
    registerScreen.classList.add('active');
});

// Ensure login form is visible when login button is clicked
document.getElementById('girisBtn').addEventListener('click', function () {
    const loginForm = document.getElementById('login-screen');
    const registerForm = document.getElementById('register-screen');

    // Hide register form and show login form
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Ensure register form is visible when register button is clicked
document.getElementById('kayitBtn').addEventListener('click', function () {
    const loginForm = document.getElementById('login-screen');
    const registerForm = document.getElementById('register-screen');

    // Hide login form and show register form
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});