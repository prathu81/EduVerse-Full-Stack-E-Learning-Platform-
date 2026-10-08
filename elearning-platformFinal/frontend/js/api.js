// ============================================================
// E-Learning Platform — Shared API & Utility Functions
// ============================================================

const API_BASE = '/api';

const API = {
  _token: () => localStorage.getItem('elp_token'),
  _user: () => { try { return JSON.parse(localStorage.getItem('elp_user')); } catch(e) { return null; } },

  headers(isForm = false) {
    const h = {};
    const token = this._token();
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (!isForm) h['Content-Type'] = 'application/json';
    return h;
  },

  async _fetch(url, opts = {}) {
    try {
        const res = await fetch(API_BASE + url, {
            headers: this.headers(),
            ...opts
        });

        const text = await res.text();

        console.log("API URL:", API_BASE + url);
        console.log("Status:", res.status);
        console.log("Response:", text);

        let data = {};

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error("Invalid JSON response:", text);
                throw new Error("Server returned invalid JSON");
            }
        }

        if (!res.ok) {
            throw new Error(data.error || `Error ${res.status}`);
        }

        return data;

    } catch (e) {
        console.error("API Error:", e);
        throw e;
    }
},

  get: (url) => API._fetch(url),
  post: (url, body) => API._fetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => API._fetch(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => API._fetch(url, { method: 'DELETE' }),

  async postForm(url, formData) {
    const res = await fetch(API_BASE + url, { method: 'POST', headers: { Authorization: `Bearer ${this._token()}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  setAuth(token, user) {
    localStorage.setItem('elp_token', token);
    localStorage.setItem('elp_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('elp_token');
    localStorage.removeItem('elp_user');
    window.location.href = '/pages/login.html';
  },

  isLoggedIn: () => !!localStorage.getItem('elp_token'),
  isAdmin: () => { const u = API._user(); return u?.role === 'admin'; },
  isStudent: () => { const u = API._user(); return u?.role === 'student'; },
  getUser: () => API._user()
};

// ── GUARDS ──
function requireAuth() {
  if (!API.isLoggedIn()) { window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname); return false; }
  return true;
}
function requireAdmin() {
  if (!API.isLoggedIn()) { window.location.href = '/pages/login.html'; return false; }
  if (!API.isAdmin()) { window.location.href = '/pages/dashboard.html'; return false; }
  return true;
}
function requireStudent() {
  if (!API.isLoggedIn()) { window.location.href = '/pages/login.html'; return false; }
  if (!API.isStudent()) { window.location.href = '/pages/admin-dashboard.html'; return false; }
  return true;
}

// ── TOAST NOTIFICATIONS ──
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'error' ? 'error' : type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'fadeOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── MODAL ──
function openModal(id) { const el = document.getElementById(id); if (el) { el.classList.add('open'); el.addEventListener('click', e => { if (e.target === el) closeModal(id); }, { once: false }); } }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }

// ── FORMAT HELPERS ──
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
function formatDateTime(d) { return new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function formatPrice(p) {
  if (!p || p === 0) return '<span class="text-success fw-700">FREE</span>';
  return `<span class="fw-700">₹${parseFloat(p).toLocaleString('en-IN')}</span>`;
}
function formatRating(r) {
  const stars = Math.round(r);
  return `<span class="course-rating">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</span> <span>${parseFloat(r).toFixed(1)}</span>`;
}
function getLiveStatus(status) {
  const map = {
    scheduled: '<span class="badge badge-primary"><i class="fas fa-clock"></i> Upcoming</span>',
    live: '<span class="badge badge-live"><i class="fas fa-circle"></i> LIVE</span>',
    completed: '<span class="badge badge-success"><i class="fas fa-check"></i> Completed</span>',
    cancelled: '<span class="badge badge-danger">Cancelled</span>'
  };
  return map[status] || status;
}

// ── CATEGORY HELPERS ──
const CAT_EMOJIS = {
  'Web Development':'🌐','Data Science':'📊','Mobile Development':'📱',
  'Cloud Computing':'☁️','Cybersecurity':'🔒','UI/UX Design':'🎨',
  'Digital Marketing':'📣','Business & Management':'💼',
  'Programming Languages':'💻','Database Management':'🗄️'
};
function getCatEmoji(name) { return CAT_EMOJIS[name] || '📚'; }

// ── COURSE CARD BUILDER ──
function buildCourseCard(course, showEnroll = true) {
  const emoji = getCatEmoji(course.category_name);
  const color = course.category_color || '#4F46E5';
  const isEnrolled = getEnrolledIds().includes(course.id);
  return `
    <div class="course-card" onclick="viewCourse(${course.id})">
      <div class="course-thumbnail" style="background:linear-gradient(135deg,${color}33,${color}11)">
        <span style="position:relative;z-index:1">${emoji}</span>
        <div class="course-badge-top">
          <span class="badge ${course.level==='Beginner'?'badge-success':course.level==='Advanced'?'badge-danger':'badge-warning'}">${course.level}</span>
        </div>
      </div>
      <div class="course-body">
        <div class="course-category-tag" style="background:${color}22;color:${color}">
          <i class="${course.category_icon||'fas fa-book'}"></i> ${course.category_name||'Course'}
        </div>
        <div class="course-title">${course.title}</div>
        <div class="course-instructor"><i class="fas fa-user-tie"></i> ${course.instructor_name||'EduVerse Instructor'}</div>
        <div class="course-meta">
          <span>${formatRating(course.rating||4.5)}</span>
          <span><i class="fas fa-clock"></i> ${course.duration_hours||0}h</span>
          <span><i class="fas fa-users"></i> ${(course.enrolled_count||0).toLocaleString()}</span>
        </div>
        <div class="course-footer">
          ${formatPrice(course.price)}
          ${showEnroll ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();handleEnroll(${course.id})">${isEnrolled ? '<i class="fas fa-check"></i> Enrolled' : 'Enroll'}</button>` : ''}
        </div>
      </div>
    </div>`;
}

function getEnrolledIds() {
  try { return JSON.parse(localStorage.getItem('elp_enrolled_ids') || '[]'); } catch(e) { return []; }
}
function setEnrolledIds(ids) { localStorage.setItem('elp_enrolled_ids', JSON.stringify(ids)); }

async function handleEnroll(courseId) {
  if (!API.isLoggedIn()) { window.location.href = `/pages/login.html?redirect=${encodeURIComponent(window.location.href)}`; return; }
  try {
    await API.post('/enrollments', { course_id: courseId });
    const ids = getEnrolledIds();
    if (!ids.includes(courseId)) { ids.push(courseId); setEnrolledIds(ids); }
    showToast('Successfully enrolled! 🎉', 'success');
    window.location.href = `/pages/dashboard.html`;
  } catch(e) {
    if (e.message.includes('Already')) { showToast('Already enrolled!', 'info'); window.location.href = '/pages/dashboard.html'; }
    else showToast(e.message || 'Enrollment failed', 'error');
  }
}

function viewCourse(id) { window.location.href = `/pages/course-detail.html?id=${id}`; }

// ── NAVBAR ──
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));
  }
  updateNavAuth();
}

function updateNavAuth() {
  const user = API.getUser();
  const loginLink = document.getElementById('navLoginLink');
  const registerLink = document.getElementById('navRegisterLink');
  const dashLink = document.getElementById('navDashLink');
  const userArea = document.getElementById('navUserArea');
  const logoutBtn = document.getElementById('navLogoutBtn');

  if (user) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (dashLink) { dashLink.style.display = 'flex'; dashLink.href = user.role === 'admin' ? '/pages/admin-dashboard.html' : '/pages/dashboard.html'; }
    if (userArea) {
      userArea.style.display = 'flex';
      const avatar = document.getElementById('navAvatarEl');
      if (avatar) { avatar.textContent = (user.full_name||'U')[0].toUpperCase(); }
      const name = document.getElementById('navNameEl');
      if (name) name.textContent = user.full_name?.split(' ')[0] || 'User';
    }
    if (logoutBtn) logoutBtn.style.display = 'flex';
  }
}

function logout() { API.logout(); }

// ── MOBILE MENU ──
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) { sidebar.classList.toggle('open'); }
  const nav = document.getElementById('mobileNavDropdown');
  if (nav) { nav.classList.toggle('open'); }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});
