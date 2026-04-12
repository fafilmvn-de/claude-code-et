export class SoundManager {
    #ctx = null;
    #enabled = true;

    #getCtx() {
        if (!this.#ctx) {
            this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if suspended (browser autoplay policy)
        if (this.#ctx.state === 'suspended') this.#ctx.resume();
        return this.#ctx;
    }

    #tone({ freq = 440, type = 'sine', duration = 0.1, vol = 0.25, attack = 0.01, delay = 0 }) {
        if (!this.#enabled) return;
        try {
            const ctx = this.#getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + attack);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration + 0.05);
        } catch (_) { /* AudioContext may not be available in test env */ }
    }

    playHit(tier = 'grey') {
        const freqs = { grey: 200, blue: 280, orange: 380, purple: 520 };
        this.#tone({ freq: freqs[tier] || 200, type: 'square', duration: 0.08, vol: 0.22 });
    }

    playComboMilestone() {
        [440, 550, 660].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.12, vol: 0.28, delay: i * 0.08 })
        );
    }

    playComboBreak() {
        this.#tone({ freq: 150, type: 'sawtooth', duration: 0.2, vol: 0.18 });
    }

    playCoinCollect() {
        this.#tone({ freq: 880, duration: 0.06, vol: 0.18 });
    }

    playPlayerHit() {
        this.#tone({ freq: 100, type: 'sawtooth', duration: 0.3, vol: 0.35 });
    }

    playBossSpawn() {
        [80, 60, 40].forEach((freq, i) =>
            this.#tone({ freq, type: 'sawtooth', duration: 0.4, vol: 0.45, delay: i * 0.15 })
        );
    }

    playBossDeath() {
        [300, 450, 600, 800].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.2, vol: 0.35, delay: i * 0.1 })
        );
    }

    playShopOpen() {
        this.#tone({ freq: 600, duration: 0.15, vol: 0.18 });
    }

    playWaveClear() {
        [330, 440, 550].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.15, vol: 0.28, delay: i * 0.1 })
        );
    }

    setEnabled(val) { this.#enabled = val; }
}
