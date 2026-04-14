// SaveManager — persists mid-run checkpoint to localStorage
const SAVE_KEY = 'catHero_saveGame';

export class SaveManager {
    save(state) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
        } catch (_) { /* storage unavailable */ }
    }

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    }

    clear() {
        try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    }

    hasSave() {
        try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; }
    }
}
