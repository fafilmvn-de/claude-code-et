/**
 * app.js — Core application logic for Stock Market Learning Guide
 * Multi-user profiles, navigation, quiz engine, supply/demand slider,
 * badges, XP, drag-and-drop ranking, progress persistence.
 *
 * Multi-user design:
 *   - Each profile stored under `stockGuide_profile_{id}` in localStorage
 *   - Profile registry stored under `stockGuide_profiles` (list of {id, name, avatar, lastAccess})
 *   - Active profile ID stored under `stockGuide_activeProfile`
 *   - Up to 5 profiles per device/browser
 *   - Quiz state (current question, answers, score) persisted per profile
 *   - Simulator state persisted per profile (see simulator.js)
 *   - Returning users see a welcome-back banner with resume/restart options
 *
 * <!-- FUTURE: Vietnamese i18n — wrap UI strings in t() function -->
 */

'use strict';

const App = (() => {
  /* ──────────── Constants ──────────── */
  const STORAGE_PREFIX = 'stockGuide_';
  const PROFILES_KEY = STORAGE_PREFIX + 'profiles';
  const ACTIVE_KEY = STORAGE_PREFIX + 'activeProfile';
  const MAX_PROFILES = 5;
  const AVATARS = ['🧑‍🎓', '👧', '👦', '🧒', '🧑‍💻', '👩‍🔬', '🧑‍🚀', '🦊', '🐱', '🐶', '🦉', '🐼'];
  const MODULE_NAMES = {
    1: 'What Are Stocks?',
    2: 'The Stock Market',
    3: 'Understanding Companies',
    4: 'Intro to Evaluation',
    5: 'How Trading Works',
    6: 'Practice Zone',
  };

  /* ──────────── State ──────────── */
  let activeProfileId = null;
  const state = {
    currentModule: 1,
    completedModules: new Set(),
    earnedBadges: new Set(),
    xp: 0,
    maxXp: 850, // (25+50+75) × 3 × 5 modules + 100 simulator = 850 total
    quizState: {},          // { module1: { current: 0, answered: [], score: 0, difficulty, questions[] } }
    difficultyProgress: {}, // { module1: { unlockedLevels: ['easy'], completedLevels: [] } }
    currentDifficulty: {},  // { module1: 'easy', ... }
    theme: 'light',
    miniTradeStep: 0,  // for Module 5 mini trade
    rankingFilled: 0,  // how many rank slots are filled
  };

  /* ──────────── Initialize ──────────── */
  function init() {
    // Check if there's an active profile
    activeProfileId = _storage(ACTIVE_KEY);
    const profiles = getProfiles();

    if (activeProfileId && profiles.find(p => p.id === activeProfileId)) {
      // Returning user — load their state and show welcome-back
      loadProfileState(activeProfileId);
      renderTheme();
      initNavigation();
      initSliders();
      initDragAndDrop();
      initAllQuizzes();
      updateXpBar();
      updateProgressDots();
      updateBadgeDisplay();
      updateNavCompletedStates();
      updateUserIndicator();
      hideProfilePicker();
      showWelcomeBack();
    } else if (profiles.length > 0) {
      // Profiles exist but none active — show picker
      renderTheme();
      showProfilePicker();
    } else {
      // Brand new — show picker with create form
      renderTheme();
      showProfilePicker();
    }

    // Enter key on profile name input
    document.getElementById('profileNameInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') createProfile();
    });
  }

  /* ──────────── Profile CRUD ──────────── */
  function getProfiles() {
    try {
      return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    } catch { return []; }
  }

  function saveProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  function createProfile() {
    const input = document.getElementById('profileNameInput');
    const name = (input?.value || '').trim();
    if (!name) {
      input?.focus();
      input?.classList.add('shake');
      setTimeout(() => input?.classList.remove('shake'), 500);
      return;
    }

    const profiles = getProfiles();
    if (profiles.length >= MAX_PROFILES) {
      alert(`Maximum ${MAX_PROFILES} profiles allowed. Please delete one first.`);
      return;
    }

    const id = 'user_' + Date.now();
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const profile = {
      id,
      name,
      avatar,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
    };

    profiles.push(profile);
    saveProfiles(profiles);

    // Initialize empty state for this profile
    activeProfileId = id;
    localStorage.setItem(ACTIVE_KEY, id);
    resetStateToDefaults();
    saveState();

    // Boot the app
    input.value = '';
    hideProfilePicker();
    renderTheme();
    initNavigation();
    initSliders();
    initDragAndDrop();
    initAllQuizzes();
    updateXpBar();
    updateProgressDots();
    updateBadgeDisplay();
    updateNavCompletedStates();
    updateUserIndicator();
  }

  function selectProfile(id) {
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    // Update last access
    profile.lastAccess = new Date().toISOString();
    saveProfiles(profiles);

    activeProfileId = id;
    localStorage.setItem(ACTIVE_KEY, id);
    loadProfileState(id);

    hideProfilePicker();
    renderTheme();
    initNavigation();
    initSliders();
    initDragAndDrop();
    initAllQuizzes();
    updateXpBar();
    updateProgressDots();
    updateBadgeDisplay();
    updateNavCompletedStates();
    updateUserIndicator();

    // Navigate to their last module
    goToModule(state.currentModule, false);
  }

  function deleteProfile(id, event) {
    event?.stopPropagation();
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    if (!confirm(`Delete ${profile.name}'s profile? All progress will be lost.`)) return;

    // Remove profile data
    localStorage.removeItem(STORAGE_PREFIX + 'profile_' + id);
    localStorage.removeItem(STORAGE_PREFIX + 'sim_' + id);

    // Remove from registry
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);

    // If deleted the active profile, clear active
    if (activeProfileId === id) {
      activeProfileId = null;
      localStorage.removeItem(ACTIVE_KEY);
    }

    renderProfileList();
  }

  /* ──────────── Profile Picker UI ──────────── */
  function showProfilePicker() {
    renderProfileList();
    document.getElementById('profileOverlay')?.classList.remove('hidden');
    document.getElementById('profileOverlay').style.display = '';
    document.getElementById('profileNameInput')?.focus();
  }

  function hideProfilePicker() {
    const overlay = document.getElementById('profileOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function renderProfileList() {
    const container = document.getElementById('profileList');
    if (!container) return;

    const profiles = getProfiles();
    if (profiles.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:12px;font-size:0.9rem;">No profiles yet — create one below! 👇</p>';
      return;
    }

    // Sort by lastAccess descending (most recent first)
    profiles.sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));

    container.innerHTML = profiles.map(p => {
      const data = _loadRawProfile(p.id);
      const xp = data?.xp || 0;
      const completed = (data?.completedModules || []).length;
      const currentMod = data?.currentModule || 1;
      const modName = MODULE_NAMES[currentMod] || 'Module ' + currentMod;
      const isActive = p.id === activeProfileId;

      return `
        <div class="profile-card ${isActive ? 'active' : ''}" onclick="App.selectProfile('${p.id}')">
          <div class="profile-avatar">${p.avatar || '👤'}</div>
          <div class="profile-info">
            <div class="profile-card-name">${_escHtml(p.name)}${isActive ? ' <span style="color:var(--teal);font-size:0.75rem;">● active</span>' : ''}</div>
            <div class="profile-card-detail">⚡ ${xp} XP · ${completed}/6 modules · Last: ${modName}</div>
          </div>
          <button class="profile-delete" onclick="App.deleteProfile('${p.id}', event)" title="Delete profile">🗑️</button>
        </div>
      `;
    }).join('');
  }

  /* ──────────── Welcome-back Banner ──────────── */
  function showWelcomeBack() {
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === activeProfileId);
    if (!profile) return;

    const completed = state.completedModules.size;
    const modName = MODULE_NAMES[state.currentModule] || 'Module ' + state.currentModule;

    const nameEl = document.getElementById('welcomeName');
    const detailEl = document.getElementById('welcomeDetail');

    if (nameEl) nameEl.textContent = `Welcome back, ${profile.name}! 👋`;

    let detail = '';
    if (completed === 0) {
      detail = `You're just getting started — let's pick up at "${modName}"!`;
    } else if (completed === 6) {
      detail = `🏆 You've completed all 6 modules! ${state.xp} XP earned. Want to replay the simulator?`;
    } else {
      detail = `${completed}/6 modules done · ${state.xp} XP · Continuing from "${modName}"`;
    }
    if (detailEl) detailEl.textContent = detail;

    const banner = document.getElementById('welcomeBanner');
    if (banner) {
      banner.style.display = 'block';
      // Auto-dismiss after 8 seconds
      setTimeout(() => dismissWelcome(), 8000);
    }
  }

  function dismissWelcome() {
    const banner = document.getElementById('welcomeBanner');
    if (banner) {
      banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      banner.style.transform = 'translateY(-100%)';
      banner.style.opacity = '0';
      setTimeout(() => { banner.style.display = 'none'; }, 300);
    }
  }

  function restartProgress() {
    if (!activeProfileId) return;
    if (!confirm('Start fresh? This will reset all your XP, badges, and quiz progress for this profile.')) return;

    resetStateToDefaults();

    // Clear simulator state too
    localStorage.removeItem(STORAGE_PREFIX + 'sim_' + activeProfileId);

    saveState();
    dismissWelcome();

    // Re-initialize UI
    initAllQuizzes();
    updateXpBar();
    updateProgressDots();
    updateBadgeDisplay();
    updateNavCompletedStates();
    goToModule(1, false);
  }

  /* ──────────── User Indicator ──────────── */
  function updateUserIndicator() {
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === activeProfileId);
    const nameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = profile?.name || 'Guest';
    if (avatarEl) avatarEl.textContent = profile?.avatar || '👤';
  }

  /* ──────────── Namespaced Storage ──────────── */
  function _storage(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function _profileKey() {
    return STORAGE_PREFIX + 'profile_' + activeProfileId;
  }

  function _loadRawProfile(id) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + 'profile_' + id);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function resetStateToDefaults() {
    state.currentModule = 1;
    state.completedModules = new Set();
    state.earnedBadges = new Set();
    state.xp = 0;
    state.quizState = {};
    state.difficultyProgress = {};
    state.currentDifficulty = {};
    state.theme = 'light';
    state.miniTradeStep = 0;
    state.rankingFilled = 0;
  }

  function loadProfileState(id) {
    resetStateToDefaults();
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + 'profile_' + id);
      if (raw) {
        const d = JSON.parse(raw);
        state.completedModules = new Set(d.completedModules || []);
        state.earnedBadges = new Set(d.earnedBadges || []);
        state.xp = d.xp || 0;
        state.theme = d.theme || 'light';
        state.currentModule = d.currentModule || 1;
        // Restore quiz state (mid-quiz progress)
        if (d.quizState) {
          state.quizState = d.quizState;
        }
        state.difficultyProgress = d.difficultyProgress || {};
        state.currentDifficulty = d.currentDifficulty || {};
      }
    } catch { /* ignore corrupted storage */ }
  }

  function saveState() {
    if (!activeProfileId) return;
    try {
      // Serialize quiz state (answered arrays are plain objects)
      const serializedQuiz = {};
      for (const [key, qs] of Object.entries(state.quizState)) {
        serializedQuiz[key] = {
          current: qs.current,
          answered: [...qs.answered],
          score: qs.score,
          difficulty: qs.difficulty || 'easy',
          questions: qs.questions || [],
        };
      }

      localStorage.setItem(_profileKey(), JSON.stringify({
        completedModules: [...state.completedModules],
        earnedBadges: [...state.earnedBadges],
        xp: state.xp,
        theme: state.theme,
        currentModule: state.currentModule,
        quizState: serializedQuiz,
        difficultyProgress: state.difficultyProgress,
        currentDifficulty: state.currentDifficulty,
        lastSaved: new Date().toISOString(),
      }));

      // Also update lastAccess on the profile registry
      const profiles = getProfiles();
      const profile = profiles.find(p => p.id === activeProfileId);
      if (profile) {
        profile.lastAccess = new Date().toISOString();
        saveProfiles(profiles);
      }
    } catch { /* ignore storage full */ }
  }

  /* ──────────── Legacy Migration ──────────── */
  // Migrate old single-key `stockGuideState` to new profile system on first run
  (function migrateLegacy() {
    try {
      const old = localStorage.getItem('stockGuideState');
      if (!old) return;

      const data = JSON.parse(old);
      // Only migrate if there are no new-format profiles yet
      if (getProfiles().length > 0) {
        localStorage.removeItem('stockGuideState');
        return;
      }

      // Create a "Learner" profile from old data
      const id = 'user_migrated_' + Date.now();
      const profile = {
        id,
        name: 'Learner',
        avatar: '🧑‍🎓',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      };
      saveProfiles([profile]);
      localStorage.setItem(STORAGE_PREFIX + 'profile_' + id, old);
      localStorage.setItem(ACTIVE_KEY, id);
      localStorage.removeItem('stockGuideState');
    } catch { /* ignore */ }
  })();

  /* ──────────── Theme ──────────── */
  function renderTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    renderTheme();
    saveState();
  }

  /* ──────────── Navigation ──────────── */
  function initNavigation() {
    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const m = parseInt(item.dataset.module);
        goToModule(m);
      });
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Mobile menu
    document.getElementById('menuToggle')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.toggle('open');
      document.getElementById('sidebarOverlay')?.classList.toggle('open');
    });
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('open');
    });

    // Show initial module
    goToModule(state.currentModule, false);
  }

  function goToModule(num, scroll = true) {
    // Pause/resume chart animation when leaving/entering module 6
    if (state.currentModule === 6 && num !== 6 && typeof Simulator !== 'undefined') {
      Simulator.pauseChart();
    }
    if (num === 6 && state.currentModule !== 6 && typeof Simulator !== 'undefined') {
      Simulator.resumeChart();
    }

    state.currentModule = num;
    saveState();

    // Toggle sections
    document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('module' + num);
    if (target) target.classList.add('active');

    // Toggle nav active
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', parseInt(n.dataset.module) === num);
    });

    // Scroll to top
    if (scroll) {
      document.getElementById('appMain')?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close mobile sidebar
    document.getElementById('appSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
  }

  function completeModule(moduleNum) {
    const moduleKey = 'module' + moduleNum;
    const diff = (state.quizState[moduleKey] && state.quizState[moduleKey].difficulty) || 'easy';

    // Unlock the next difficulty tier
    if (moduleNum !== 6) {
      unlockNextDifficulty(moduleKey, diff);
    }

    // Only award badge on first-ever completion (easy tier)
    if (!state.completedModules.has(moduleNum) && diff === 'easy') {
      state.completedModules.add(moduleNum);
      const badge = BADGES.find(b => b.module === moduleNum);
      if (badge && !state.earnedBadges.has(badge.id)) {
        state.earnedBadges.add(badge.id);
        // Module 6 (simulator) still uses xpPerSimulation for its badge label
        if (moduleNum === 6) state.xp += CONFIG.xpPerSimulation;
        showBadge(badge);
      }
    } else if (!state.completedModules.has(moduleNum) && diff !== 'easy') {
      // Medium/hard completion: track but no badge popup
      state.completedModules.add(moduleNum);
    }

    // Show "quiz complete" UI for this difficulty tier
    if (moduleNum !== 6) {
      const container = document.querySelector('#quiz-' + moduleKey + ' .quiz-body');
      if (container) {
        const diffLabels = { easy: '⭐ Easy', medium: '⭐⭐ Medium', hard: '⭐⭐⭐ Hard' };
        const nextDiff = { easy: 'medium', medium: 'hard', hard: null };
        const next = nextDiff[diff];
        const nextHint = next
          ? `<p style="margin-top:8px;font-size:0.85rem;color:var(--text-muted);">🔓 ${diffLabels[next]} difficulty is now unlocked! Try it above.</p>`
          : '<p style="margin-top:8px;font-size:0.85rem;color:var(--amber);">🏆 All difficulty levels complete for this module!</p>';
        container.innerHTML = `
          <p style="text-align:center;color:var(--green);font-weight:600;">✅ ${diffLabels[diff]} quiz complete!</p>
          ${nextHint}
          <div style="text-align:center;margin-top:12px;">
            <button class="btn-secondary" onclick="App._resetDifficultyQuiz('${moduleKey}', ${moduleNum})">Try again 🔄</button>
          </div>
        `;
      }
    }

    updateProgressDots();
    updateBadgeDisplay();
    updateNavCompletedStates();
    updateXpBar();
    saveState();
  }

  /* ──────────── XP & Progress ──────────── */
  function updateXpBar() {
    const fill = document.getElementById('xpBarFill');
    const label = document.getElementById('xpLabel');
    if (fill) fill.style.width = Math.min(100, (state.xp / state.maxXp) * 100) + '%';
    if (label) label.textContent = state.xp + ' XP';
  }

  function updateProgressDots() {
    document.querySelectorAll('.progress-dot').forEach(dot => {
      const m = parseInt(dot.dataset.module);
      dot.classList.toggle('filled', state.completedModules.has(m));
    });
  }

  function updateNavCompletedStates() {
    document.querySelectorAll('.nav-item').forEach(n => {
      const m = parseInt(n.dataset.module);
      n.classList.toggle('completed', state.completedModules.has(m));
    });
  }

  /* ──────────── Badge System ──────────── */
  function updateBadgeDisplay() {
    document.querySelectorAll('.badge-mini').forEach(b => {
      b.classList.toggle('earned', state.earnedBadges.has(b.dataset.badge));
    });
  }

  function showBadge(badge) {
    const overlay = document.getElementById('badgeOverlay');
    document.getElementById('badgePopupEmoji').textContent = badge.emoji;
    document.getElementById('badgePopupTitle').textContent = badge.name;
    document.getElementById('badgePopupDesc').textContent = badge.description;
    const xpAmount = badge.module === 6 ? CONFIG.xpPerSimulation : CONFIG.xpPerQuiz;
    document.getElementById('badgePopupXp').textContent = '+' + xpAmount + ' XP';
    overlay.style.display = 'flex';
    spawnConfetti();
  }

  function closeBadge() {
    document.getElementById('badgeOverlay').style.display = 'none';
  }

  function spawnConfetti() {
    const colors = ['#f59e0b', '#14b8a6', '#8b5cf6', '#f43f5e', '#3b82f6', '#10b981', '#ec4899'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = '-10px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.8) + 's';
      piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  }

  /* ──────────── Difficulty System ──────────── */

  function getDifficultyState(moduleKey) {
    if (!state.difficultyProgress[moduleKey]) {
      state.difficultyProgress[moduleKey] = { unlockedLevels: ['easy'], completedLevels: [] };
    }
    return state.difficultyProgress[moduleKey];
  }

  function getQuestionsForDifficulty(moduleKey, difficulty) {
    return (QUIZ_DATA[moduleKey] || []).filter(q => q.difficulty === difficulty);
  }

  function unlockNextDifficulty(moduleKey, completedLevel) {
    const ds = getDifficultyState(moduleKey);
    if (!ds.completedLevels.includes(completedLevel)) {
      ds.completedLevels.push(completedLevel);
    }
    if (completedLevel === 'easy' && !ds.unlockedLevels.includes('medium')) {
      ds.unlockedLevels.push('medium');
    }
    if (completedLevel === 'medium' && !ds.unlockedLevels.includes('hard')) {
      ds.unlockedLevels.push('hard');
    }
    saveState();
    // Re-render selector to reflect the unlock
    const moduleNum = parseInt(moduleKey.replace('module', ''));
    const quizContainer = document.querySelector('#quiz-' + moduleKey);
    if (quizContainer) renderDifficultySelector(moduleKey, moduleNum, quizContainer);
  }

  function renderDifficultySelector(moduleKey, moduleNum, quizContainer) {
    const ds = getDifficultyState(moduleKey);
    const active = state.currentDifficulty[moduleKey] || 'easy';
    const levels = [
      { id: 'easy',   label: '⭐ Easy',         cls: 'easy' },
      { id: 'medium', label: '⭐⭐ Medium',      cls: 'medium' },
      { id: 'hard',   label: '⭐⭐⭐ Hard',      cls: 'hard' },
    ];

    const buttonsHtml = levels.map(lv => {
      const unlocked = ds.unlockedLevels.includes(lv.id);
      const completed = ds.completedLevels.includes(lv.id);
      const isActive = active === lv.id;
      let cls = `diff-btn ${lv.cls}`;
      if (isActive) cls += ' active';
      if (!unlocked) cls += ' locked';
      const lockIcon = !unlocked ? ' 🔒' : (completed ? ' ✓' : '');
      return `<button class="${cls}" data-level="${lv.id}" ${!unlocked ? 'disabled' : ''} onclick="App._selectDifficulty('${moduleKey}', ${moduleNum}, '${lv.id}')">${lv.label}${lockIcon}</button>`;
    }).join('');

    let selector = quizContainer.querySelector('.difficulty-selector');
    if (!selector) {
      selector = document.createElement('div');
      selector.className = 'difficulty-selector';
      const quizBody = quizContainer.querySelector('.quiz-body');
      if (quizBody) quizContainer.insertBefore(selector, quizBody);
      else quizContainer.prepend(selector);
    }
    selector.innerHTML = `<span class="diff-label">Difficulty:</span>${buttonsHtml}`;
  }

  function _selectDifficulty(moduleKey, moduleNum, level) {
    const ds = getDifficultyState(moduleKey);
    if (!ds.unlockedLevels.includes(level)) return;
    state.currentDifficulty[moduleKey] = level;
    saveState();
    initQuiz(moduleKey, moduleNum);
    renderDifficultySelector(moduleKey, moduleNum, document.querySelector('#quiz-' + moduleKey));
  }

  function _resetDifficultyQuiz(moduleKey, moduleNum) {
    const diff = state.currentDifficulty[moduleKey] || 'easy';
    const questions = getQuestionsForDifficulty(moduleKey, diff);
    state.quizState[moduleKey] = { current: 0, answered: [], score: 0, difficulty: diff, questions };
    saveState();
    renderQuizQuestion(moduleKey, moduleNum);
  }

  /* ──────────── Quiz Engine ──────────── */
  function initAllQuizzes() {
    for (const moduleKey of Object.keys(QUIZ_DATA)) {
      const moduleNum = parseInt(moduleKey.replace('module', ''));
      const quizContainer = document.querySelector('#quiz-' + moduleKey);
      if (quizContainer) renderDifficultySelector(moduleKey, moduleNum, quizContainer);
      initQuiz(moduleKey, moduleNum);
    }
  }

  function initQuiz(moduleKey, moduleNum) {
    const diff = state.currentDifficulty[moduleKey] || 'easy';
    const questions = getQuestionsForDifficulty(moduleKey, diff);
    if (!questions || questions.length === 0) return;

    const saved = state.quizState[moduleKey];
    const isSameDiff = saved && saved.difficulty === diff;

    if (isSameDiff && saved.answered && saved.answered.length > 0) {
      // Resume mid-quiz for this difficulty; ensure questions array is populated
      if (!saved.questions || saved.questions.length === 0) {
        saved.questions = questions;
      }
      renderQuizQuestion(moduleKey, moduleNum);
    } else {
      // Fresh quiz for this difficulty
      state.quizState[moduleKey] = { current: 0, answered: [], score: 0, difficulty: diff, questions };
      renderQuizQuestion(moduleKey, moduleNum);
    }
  }

  function renderQuizQuestion(moduleKey, moduleNum) {
    const qs = state.quizState[moduleKey];
    if (!qs) return;
    const questions = qs.questions && qs.questions.length > 0
      ? qs.questions
      : getQuestionsForDifficulty(moduleKey, qs.difficulty || 'easy');
    const q = questions[qs.current];
    const container = document.querySelector('#quiz-' + moduleKey + ' .quiz-body');
    if (!container || !q) return;

    const diff = qs.difficulty || 'easy';
    const diffLabels = { easy: '⭐ Easy', medium: '⭐⭐ Medium', hard: '⭐⭐⭐ Hard' };

    let html = `
      <div class="quiz-progress">Question ${qs.current + 1} of ${questions.length} · ${diffLabels[diff]}</div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
    `;
    q.options.forEach((opt, i) => {
      const answered = qs.answered[qs.current] !== undefined;
      const isCorrect = i === q.correct;
      const wasSelected = qs.answered[qs.current] === i;
      let cls = 'quiz-option';
      if (answered) {
        cls += ' disabled';
        if (isCorrect) cls += ' correct';
        else if (wasSelected) cls += ' wrong';
      }
      html += `<button class="${cls}" data-idx="${i}" ${answered ? 'disabled' : ''}>${opt}</button>`;
    });
    html += '</div>';

    // Feedback
    const answered = qs.answered[qs.current] !== undefined;
    if (answered) {
      const isCorrect = qs.answered[qs.current] === q.correct;
      html += `<div class="quiz-feedback show ${isCorrect ? 'correct' : 'wrong'}">
        ${isCorrect ? '✅ Correct!' : '❌ Not quite.'} ${q.explanation}
      </div>`;
    }

    // Nav
    const claimLabel = diff === 'easy' ? 'Claim Badge! 🏅' : `Complete ${diffLabels[diff]}! ✓`;
    html += '<div class="quiz-nav">';
    html += `<span class="quiz-progress">Score: ${qs.score}/${questions.length}</span>`;
    if (answered && qs.current < questions.length - 1) {
      html += `<button class="btn-primary" onclick="App._quizNext('${moduleKey}', ${moduleNum})">Next Question →</button>`;
    } else if (answered && qs.current === questions.length - 1) {
      html += `<button class="btn-primary" onclick="App.completeModule(${moduleNum})">${claimLabel}</button>`;
    }
    html += '</div>';

    container.innerHTML = html;

    // Bind option clicks
    if (!answered) {
      container.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          qs.answered[qs.current] = idx;
          if (idx === q.correct) {
            qs.score++;
            state.xp += CONFIG.xpPerCorrect[diff] || 25;
            updateXpBar();
          }
          saveState();
          renderQuizQuestion(moduleKey, moduleNum);
        });
      });
    }
  }

  function _quizNext(moduleKey, moduleNum) {
    state.quizState[moduleKey].current++;
    saveState();
    renderQuizQuestion(moduleKey, moduleNum);
  }

  /* ──────────── Supply & Demand Slider (Module 2) ──────────── */
  function initSliders() {
    const buyerSlider = document.getElementById('buyerSlider');
    const sellerSlider = document.getElementById('sellerSlider');
    if (!buyerSlider || !sellerSlider) return;

    const update = () => {
      const buyers = parseInt(buyerSlider.value);
      const sellers = parseInt(sellerSlider.value);
      document.getElementById('buyerVal').textContent = buyers;
      document.getElementById('sellerVal').textContent = sellers;

      // Price formula: base $50, adjusted by buyer/seller ratio
      const ratio = buyers / Math.max(sellers, 1);
      const price = Math.max(5, Math.min(200, 50 * ratio));
      const priceEl = document.getElementById('sliderPrice');
      const arrowEl = document.getElementById('sliderArrow');
      const explainEl = document.getElementById('sliderExplain');

      priceEl.textContent = '$' + price.toFixed(2);

      if (ratio > 1.15) {
        arrowEl.textContent = '📈';
        priceEl.style.color = 'var(--gain)';
        explainEl.textContent = 'More buyers than sellers — price goes UP!';
      } else if (ratio < 0.85) {
        arrowEl.textContent = '📉';
        priceEl.style.color = 'var(--loss)';
        explainEl.textContent = 'More sellers than buyers — price goes DOWN!';
      } else {
        arrowEl.textContent = '⬌';
        priceEl.style.color = 'var(--teal)';
        explainEl.textContent = 'Balanced — roughly equal buyers and sellers';
      }
    };

    buyerSlider.addEventListener('input', update);
    sellerSlider.addEventListener('input', update);
    update();
  }

  /* ──────────── Drag & Drop Ranking (Module 3) ──────────── */
  function initDragAndDrop() {
    const cards = document.querySelectorAll('.company-card[draggable]');
    const slots = document.querySelectorAll('.rank-slot');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.company);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    slots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const companyId = e.dataTransfer.getData('text/plain');
        placeCompanyInSlot(companyId, slot);
      });
    });
  }

  function placeCompanyInSlot(companyId, slot) {
    const company = COMPANIES.find(c => c.id === companyId);
    if (!company) return;

    // Check if already placed in this slot
    if (slot.dataset.filled === companyId) return;

    // Remove from previous slot if already placed elsewhere
    document.querySelectorAll('.rank-slot').forEach(s => {
      if (s.dataset.filled === companyId) {
        s.dataset.filled = '';
        s.querySelector('.rank-content').textContent = 'Drop a company here';
        state.rankingFilled--;
      }
    });

    // If slot was already occupied by another company, free it
    if (slot.dataset.filled) {
      state.rankingFilled--;
    }

    // Place in slot
    slot.dataset.filled = companyId;
    slot.querySelector('.rank-content').innerHTML = `${company.emoji} <strong>${company.name}</strong>`;
    state.rankingFilled++;

    // Hide original card
    const card = document.querySelector(`.company-card[data-company="${companyId}"]`);
    if (card) card.style.opacity = '0.4';

    // Check if all placed
    if (state.rankingFilled >= 3) {
      document.getElementById('rankFeedback').style.display = 'block';
    }
  }

  /* ──────────── Module 4: Investment Pick ──────────── */
  function pickInvestment(choice) {
    const fb = document.getElementById('investFeedback');
    const pickA = document.getElementById('pickA');
    const pickB = document.getElementById('pickB');

    pickA.style.pointerEvents = 'none';
    pickB.style.pointerEvents = 'none';

    if (choice === 'A') {
      pickA.style.borderColor = 'var(--green)';
      pickA.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.3)';
      pickB.style.opacity = '0.5';
      fb.style.background = 'var(--quiz-correct)';
      fb.style.border = '1px solid var(--green)';
      fb.innerHTML = '✅ <strong>Great thinking!</strong> SteadyMart shows consistent growth, steady profits, and a strong brand — all great signs for a long-term investment. Remember: boring can be beautiful in investing! 🌳';
    } else {
      pickB.style.borderColor = 'var(--coral)';
      pickB.style.boxShadow = '0 0 0 3px rgba(244,63,94,0.3)';
      pickA.style.opacity = '0.5';
      fb.style.background = 'var(--quiz-wrong)';
      fb.style.border = '1px solid var(--coral)';
      fb.innerHTML = '🤔 <strong>Interesting choice!</strong> HypeTech has high revenue growth, but it\'s inconsistent and the company is losing money. Social media hype fades fast. For a 5-year investment, SteadyMart would likely be safer. But it\'s great that you\'re thinking about it! 🧠';
    }
    fb.style.display = 'block';
  }

  /* ──────────── Module 5: Mini Trade ──────────── */
  function miniTradeBuy() {
    const resultDiv = document.getElementById('miniTradeResult');
    const stateDiv = document.getElementById('miniTradeState');

    stateDiv.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">Processing your order... ⏳</p>';

    setTimeout(() => {
      // Simulate price change
      const oldPrice = 45;
      const changePercent = (Math.random() * 20 - 5); // -5% to +15% bias positive
      const newPrice = +(oldPrice * (1 + changePercent / 100)).toFixed(2);
      const gain = +(newPrice - oldPrice).toFixed(2);
      const gainClass = gain >= 0 ? 'positive' : 'negative';
      const gainSign = gain >= 0 ? '+' : '';

      document.getElementById('miniPrice').textContent = '$' + newPrice.toFixed(2);

      stateDiv.innerHTML = `
        <p style="font-weight:600;color:var(--teal);">✅ You bought 1 share of SnackCo at $${oldPrice.toFixed(2)}</p>
      `;

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div style="padding:16px;border-radius:10px;background:var(--bg);border:1px solid var(--border);margin-bottom:12px;">
          <p>📊 <strong>One week later...</strong> SnackCo's price moved to <strong>$${newPrice.toFixed(2)}</strong></p>
          <p class="${gainClass}" style="font-size:1.2rem;">${gainSign}$${gain.toFixed(2)} per share (${gainSign}${changePercent.toFixed(1)}%)</p>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">${gain >= 0 ? '🎉 Your investment went up! But remember, this could also have gone down.' : '📉 Your investment went down. But that\'s okay — stocks go up and down. Long-term is what matters!'}</p>
        </div>
        <button class="btn-secondary" onclick="App.resetMiniTrade()">Try Again 🔄</button>
      `;
    }, 1200);
  }

  function resetMiniTrade() {
    document.getElementById('miniPrice').textContent = '$45.00';
    document.getElementById('miniTradeState').innerHTML = `
      <button class="btn-primary" onclick="App.miniTradeBuy()">🛒 Buy 1 Share for $45.00</button>
    `;
    document.getElementById('miniTradeResult').style.display = 'none';
  }

  /* ──────────── Helpers ──────────── */
  function _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ──────────── Public API ──────────── */
  return {
    init,
    goToModule,
    completeModule,
    closeBadge,
    pickInvestment,
    miniTradeBuy,
    resetMiniTrade,
    placeCompanyInSlot,
    _quizNext,
    _selectDifficulty,
    _resetDifficultyQuiz,
    // Profile system
    createProfile,
    selectProfile,
    deleteProfile,
    showProfilePicker,
    dismissWelcome,
    restartProgress,
    // Internals exposed for simulator integration
    get state() { return state; },
    get activeProfileId() { return activeProfileId; },
    get STORAGE_PREFIX() { return STORAGE_PREFIX; },
    saveState,
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);
