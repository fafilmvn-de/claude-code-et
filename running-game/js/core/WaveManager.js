// WaveManager — owns wave number, enemy spawn schedule, boss/shop triggers
export class WaveManager {
    #wave = 0;
    #remaining = 0;
    #total = 0;
    #spawnMult = 1;
    #onWaveCleared;
    #onSpawnEnemy;
    #onBossWaveStart;

    constructor({ onWaveCleared, onSpawnEnemy, onBossWaveStart, spawnMult = 1 }) {
        this.#onWaveCleared = onWaveCleared;
        this.#onSpawnEnemy = onSpawnEnemy;
        this.#onBossWaveStart = onBossWaveStart;
        this.#spawnMult = spawnMult;
    }

    /** Set wave counter so next startWave() begins at wave n. Used for save/resume. */
    setStartWave(n) { this.#wave = Math.max(0, n - 1); }

    startWave() {
        this.#wave++;
        const config = this.#buildConfig(this.#wave);

        if (this.isBossWave(this.#wave)) {
            this.#onBossWaveStart(this.#wave);
            this.#onSpawnEnemy('bear', 1);
            this.#onSpawnEnemy(this.#primaryTypeFor(this.#wave), 4);
            this.#remaining = 5;
        } else {
            const types = this.getEnemyTypesForWave(this.#wave);
            // Distribute exactly config.total — floor+remainder avoids spawning
            // more enemies than #remaining tracks (prevents cascade wave bug)
            const base = Math.floor(config.total / types.length);
            let leftover = config.total % types.length;
            let spawned = 0;
            types.forEach(type => {
                const count = base + (leftover-- > 0 ? 1 : 0);
                if (count > 0) this.#onSpawnEnemy(type, count);
                spawned += count;
            });
            this.#remaining = spawned; // equals config.total exactly
        }
        this.#total = this.#remaining;
    }

    enemyKilled() {
        this.#remaining = Math.max(0, this.#remaining - 1);
        if (this.#remaining === 0) {
            this.#onWaveCleared(this.#wave);
        }
    }

    getRemainingCount() { return this.#remaining; }
    getWaveTotal() { return this.#total; }
    getCurrentWave() { return this.#wave; }

    isBossWave(wave) { return wave > 0 && wave % 10 === 0; }

    shouldOpenShop(wave) { return wave % 5 === 0 && !this.isBossWave(wave); }

    getEnemyTypesForWave(wave) {
        const types = ['boar'];
        if (wave >= 5) types.push('raccoon');
        if (wave >= 10) types.push('fox');
        if (wave >= 15) types.push('wolf');
        if (wave >= 20) types.push('bug');
        return types;
    }

    #primaryTypeFor(wave) {
        if (wave >= 20) return 'bug';
        if (wave >= 15) return 'wolf';
        if (wave >= 10) return 'fox';
        if (wave >= 5) return 'raccoon';
        return 'boar';
    }

    #buildConfig(wave) {
        if (this.isBossWave(wave)) return { total: 5 }; // 1 bear + 4 normal
        const base = Math.min(3 + Math.floor(wave * 1.5), 30 + wave); // soft cap
        const total = Math.max(1, Math.round(base * this.#spawnMult));
        return { total };
    }
}
