const STORAGE_KEY = 'catHero_leaderboard';
const MAX_ENTRIES = 10;

export class LeaderboardManager {
    calculateScore({ wavesSurvived, totalKills, coinsSpent, maxCombo }) {
        return (wavesSurvived * 100) + (totalKills * 10) + (coinsSpent * 5) + (maxCombo * 20);
    }

    saveScore({ name, score, wavesSurvived, maxCombo }) {
        const board = this.getTopTen();
        board.push({
            name: (name || 'Anonymous').trim().slice(0, 12),
            score,
            wavesSurvived,
            maxCombo,
            date: new Date().toLocaleDateString()
        });
        board.sort((a, b) => b.score - a.score);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board.slice(0, MAX_ENTRIES)));
        localStorage.setItem('catHero_lastName', name || '');
    }

    getTopTen() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    getPersonalBest() {
        const board = this.getTopTen();
        return board.length ? board[0] : null;
    }

    getLastName() {
        return localStorage.getItem('catHero_lastName') || '';
    }

    renderLeaderboard(currentScore) {
        const board = this.getTopTen();
        const container = document.getElementById('leaderboard-table');
        if (!container) return;
        const medals = ['🥇', '🥈', '🥉'];

        container.innerHTML = board.length === 0
            ? '<p class="text-center text-gray-500">No scores yet — be the first!</p>'
            : board.map((entry, i) => `
                <div class="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2
                    ${entry.score === currentScore ? 'border-2 border-yellow-400' : ''}">
                    <span class="text-lg">${medals[i] || `${i + 1}.`}</span>
                    <span class="flex-1 ml-3 font-bold text-white">${entry.name}</span>
                    <span class="text-yellow-400 font-bold">${entry.score.toLocaleString()}</span>
                    <span class="text-gray-400 text-sm ml-3">Wave ${entry.wavesSurvived}</span>
                </div>
            `).join('');

        const pbLine = document.getElementById('personal-best-line');
        if (pbLine) {
            if (!board.find(e => e.score === currentScore) && currentScore > 0) {
                pbLine.textContent = `Your score this run: ${currentScore.toLocaleString()}`;
            } else {
                pbLine.textContent = '';
            }
        }
    }
}
