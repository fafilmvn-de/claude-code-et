// WaveManager — owns wave number, enemy spawn schedule, boss/shop triggers
export class WaveManager {
    #wave = 0;
    #remaining = 0;
    #onWaveCleared;
    #onSpawnEnemy;
    #onBossWaveStart;

    constructor({ onWaveCleared, onSpawnEnemy, onBossWaveStart }) {
        this.#onWaveCleared = onWaveCleared;
        this.#onSpawnEnemy = onSpawnEnemy;
        this.#onBossWaveStart = onBossWaveStart;
    }

    startWave() {
        this.#wave++;
        const config = this.#buildConfig(this.#wave);
        this.#remaining = config.total;

        if (this.isBossWave(this.#wave)) {
            this.#onBossWaveStart(this.#wave);
            this.#onSpawnEnemy('bear', 1);
            this.#onSpawnEnemy(this.#primaryTypeFor(this.#wave), 4);
        } else {
            const types = this.getEnemyTypesForWave(this.#wave);
            const perType = Math.ceil(config.total / types.length);
            types.forEach(type => this.#onSpawnEnemy(type, perType));
        }
    }

    enemyKilled() {
        this.#remaining = Math.max(0, this.#remaining - 1);
        if (this.#remaining === 0) {
            this.#onWaveCleared(this.#wave);
        }
    }

    getRemainingCount() { return this.#remaining; }
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
        const total = Math.min(3 + Math.floor(wave * 1.5), 30 + wave); // soft cap
        return { total };
    }
}
