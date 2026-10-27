import { api } from 'js/api.js';

const TOKEN_KEYS = ['token', 'jwt', 'accessToken', 'travelplan_token'];
const USER_CACHE_KEY = 'travelplan_user';
const DEFAULT_USER = {
  id: 1,
  fullName: 'Nguyễn Văn A',
  email: 'ngva@gmail.com',
  role: 'USER'
};

function getAuthToken() {
  for (const key of TOKEN_KEYS) {
    const val = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (val) return val;
  }
  return null;
}

function clearAllAuthTokens() {
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  localStorage.removeItem(USER_CACHE_KEY);
  sessionStorage.removeItem(USER_CACHE_KEY);
}

function getSafeInternalNextPath(customPath) {
  const rawPath = customPath || (window.location.pathname + window.location.search);
  if (typeof rawPath === 'string' && rawPath.startsWith('/') && !rawPath.startsWith('//')) {
    return rawPath;
  }
  return '/';
}

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'NA';
  const normalized = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-region') || document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// ============================================================================
// 1. XỬ LÝ HẾT PHIÊN LÀM VIỆC (401 / MSG 10)
// ============================================================================
function handleSessionExpired401() {
  clearAllAuthTokens();
  updateHeaderAuthUI();
  closeAccountMenu();
  closeLogoutConfirmPopup();

  const modalMsg10 = document.getElementById('modal-msg-10');
  if (modalMsg10) {
    modalMsg10.removeAttribute('hidden');
    modalMsg10.classList.add('active');
  }
}

function confirmSessionExpiredRedirect() {
  const modalMsg10 = document.getElementById('modal-msg-10');
  if (modalMsg10) {
    modalMsg10.setAttribute('hidden', '');
    modalMsg10.classList.remove('active');
  }

  const nextPath = getSafeInternalNextPath();
  const targetUrl = `/dang-nhap?next=${encodeURIComponent(nextPath)}`;
  window.location.href = targetUrl;
}

// ============================================================================
// 2. LUỒNG UC 3: ĐĂNG XUẤT TRÊN HEADER
// ============================================================================
function openLogoutConfirmPopup() {
  closeAccountMenu();
  const modalMsg26 = document.getElementById('modal-msg-26');
  if (modalMsg26) {
    modalMsg26.removeAttribute('hidden');
    modalMsg26.classList.add('active');
  }
}

function closeLogoutConfirmPopup() {
  const modalMsg26 = document.getElementById('modal-msg-26');
  if (modalMsg26) {
    modalMsg26.setAttribute('hidden', '');
    modalMsg26.classList.remove('active');
  }
}

function executeLogoutB4() {
  clearAllAuthTokens();
  closeLogoutConfirmPopup();
  updateHeaderAuthUI();
  showToast('Đã đăng xuất thành công. Đã chuyển về chế độ Khách.', 'success');
}

// ============================================================================
// 3. QUY TẮC CBR 3: CHẶN TRANG RIÊNG TƯ KHI CHƯA ĐĂNG NHẬP
// ============================================================================
function redirectGuestToLogin(action = '', id = '', customNextPath = null) {
  const nextPath = getSafeInternalNextPath(customNextPath);
  const params = new URLSearchParams();
  params.set('next', nextPath);
  if (action) params.set('action', action);
  if (id) params.set('id', id);
  const loginUrl = `/dang-nhap?${params.toString()}`;
  
  showToast(`CBR 3: Cần đăng nhập → ${loginUrl}`, 'warning');
  setTimeout(() => {
    window.location.href = loginUrl;
  }, 500);
}

function setupProtectedLinks() {
  document.addEventListener('click', (e) => {
    const protectedLink = e.target.closest('[data-requires-auth="true"]');
    if (!protectedLink) return;

    if (!getAuthToken()) {
      e.preventDefault();
      const href = protectedLink.getAttribute('href') || '/chuyen-di';
      const action = protectedLink.getAttribute('data-action') || '';
      const nextUrl = action === 'create-trip' ? getSafeInternalNextPath() : href;
      redirectGuestToLogin(action, '', nextUrl);
    }
  });
}

// ============================================================================
// 4. ĐỒNG BỘ GIAO DIỆN HEADER (GỌI API /auth/me TỪ api.js)
// ============================================================================
async function fetchCurrentUserProfile() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await api('/auth/me', { auth: true, silent: true });
    if (res) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(res));
      return res;
    }
  } catch (err) {
    if (err && (err.status === 401 || err.statusCode === 401)) {
      handleSessionExpired401();
      return null;
    }
  }

  try {
    const cached = localStorage.getItem(USER_CACHE_KEY) || sessionStorage.getItem(USER_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  return DEFAULT_USER;
}

async function updateHeaderAuthUI() {
  const token = getAuthToken();
  const guestEl = document.getElementById('auth-guest');
  const memberEl = document.getElementById('auth-member');
  const avatarInitialsEl = document.getElementById('avatar-initials');
  const userNameEl = document.getElementById('account-user-name');
  const userEmailEl = document.getElementById('account-user-email');
  const demoStatusEl = document.getElementById('demo-auth-status');
  const demoToggleBtn = document.getElementById('demo-toggle-auth');

  if (!token) {
    if (guestEl) guestEl.classList.remove('hidden');
    if (memberEl) memberEl.classList.add('hidden');
    if (demoStatusEl) demoStatusEl.textContent = 'Khách';
    if (demoToggleBtn) demoToggleBtn.textContent = 'Đổi Thành viên';
    return;
  }

  if (guestEl) guestEl.classList.add('hidden');
  if (memberEl) memberEl.classList.remove('hidden');
  if (demoStatusEl) demoStatusEl.textContent = 'Thành viên';
  if (demoToggleBtn) demoToggleBtn.textContent = 'Đổi Khách';

  const user = await fetchCurrentUserProfile();
  if (user) {
    const fullName = user.fullName || user.full_name || user.name || DEFAULT_USER.fullName;
    const email = user.email || DEFAULT_USER.email;
    if (avatarInitialsEl) avatarInitialsEl.textContent = getInitials(fullName);
    if (userNameEl) userNameEl.textContent = fullName;
    if (userEmailEl) userEmailEl.textContent = email;
  }
}

function toggleAccountMenu() {
  const dropdown = document.getElementById('account-dropdown');
  const trigger = document.getElementById('avatar-menu-trigger');
  if (!dropdown || !trigger) return;

  const isOpen = dropdown.hasAttribute('hidden');
  if (isOpen) {
    dropdown.removeAttribute('hidden');
    dropdown.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  } else {
    dropdown.setAttribute('hidden', '');
    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
}

function closeAccountMenu() {
  const dropdown = document.getElementById('account-dropdown');
  const trigger = document.getElementById('avatar-menu-trigger');
  if (dropdown) {
    dropdown.setAttribute('hidden', '');
    dropdown.classList.remove('open');
  }
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

// ============================================================================
// 5. KHỞI TẠO SỰ KIỆN
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!getAuthToken() && !sessionStorage.getItem('__uc3_initialized')) {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_ngva');
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(DEFAULT_USER));
    sessionStorage.setItem('__uc3_initialized', 'true');
  }

  updateHeaderAuthUI();
  setupProtectedLinks();

  const avatarTrigger = document.getElementById('avatar-menu-trigger');
  if (avatarTrigger) {
    avatarTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccountMenu();
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#auth-member')) {
      closeAccountMenu();
    }
  });

  document.getElementById('btn-logout-menu')?.addEventListener('click', (e) => {
    e.preventDefault();
    openLogoutConfirmPopup();
  });

  document.getElementById('btn-cancel-logout')?.addEventListener('click', closeLogoutConfirmPopup);
  document.getElementById('btn-confirm-logout')?.addEventListener('click', executeLogoutB4);
  document.getElementById('btn-ok-session-expired')?.addEventListener('click', confirmSessionExpiredRedirect);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLogoutConfirmPopup();
      closeAccountMenu();
    }
  });

  document.getElementById('demo-toggle-auth')?.addEventListener('click', () => {
    if (getAuthToken()) {
      clearAllAuthTokens();
      updateHeaderAuthUI();
      showToast('Đã chuyển sang chế độ Khách.', 'warning');
    } else {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_ngva');
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(DEFAULT_USER));
      updateHeaderAuthUI();
      showToast('Đã giả lập Đăng nhập thành viên (Nguyễn Văn A).', 'success');
    }
  });

  document.getElementById('demo-trigger-logout')?.addEventListener('click', () => {
    if (!getAuthToken()) {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_ngva');
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(DEFAULT_USER));
      updateHeaderAuthUI();
    }
    openLogoutConfirmPopup();
  });

  document.getElementById('demo-trigger-401')?.addEventListener('click', () => {
    handleSessionExpired401();
  });
});