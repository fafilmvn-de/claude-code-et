export class ComboSystem {
    #count = 0;
    #windowMs = 2000;
    #timer = 0;
    #onChanged;
    #onBreak;
    #onMilestone;
    #prevMult = 1;

    constructor({ onChanged, onBreak, onMilestone }) {
        this.#onChanged = onChanged;
        this.#onBreak = onBreak;
        this.#onMilestone = onMilestone;
    }

    hit() {
        this.#count++;
        this.#timer = this.#windowMs;
        const mult = this.getMultiplier();
        this.#onChanged(this.#count, mult, this.getTier(), this.getTimerFraction());
        if (mult > this.#prevMult) {
            this.#onMilestone(mult, this.getTier());
            this.#prevMult = mult;
        }
    }

    update(deltaMs) {
        if (this.#count === 0) return;
        this.#timer -= deltaMs;
        if (this.#timer <= 0) {
            this.#count = 0;
            this.#timer = 0;
            this.#prevMult = 1;
            this.#onBreak();
        }
    }

    getCount() { return this.#count; }

    getMultiplier() {
        if (this.#count >= 20) return 4;
        if (this.#count >= 10) return 3;
        if (this.#count >= 5) return 2;
        return 1;
    }

    getTier() {
        if (this.#count >= 20) return 'purple';
        if (this.#count >= 10) return 'orange';
        if (this.#count >= 5) return 'blue';
        return 'grey';
    }

    isBlastReady() { return this.getMultiplier() >= 3; }

    getTimerFraction() {
        return this.#count > 0 ? Math.max(0, this.#timer / this.#windowMs) : 0;
    }

    extendWindow(ms) {
        this.#windowMs += ms;
        if (this.#count > 0) this.#timer += ms;
    }

    reset() {
        this.#count = 0;
        this.#timer = 0;
        this.#prevMult = 1;
    }
}
