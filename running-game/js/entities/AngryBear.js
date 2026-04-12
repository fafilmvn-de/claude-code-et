// AngryBear enemy - Boss: 20 HP, 3× size, phase-2 charge at ≤10 HP
export class AngryBear {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1.0;
        this.size = 72;
        this.maxHp = 20;
        this.hp = 20;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🐻';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.phase = 1;
        this.chargeDir = null;
        this.chargeDuration = 0;
        this.chargeWindup = 0; // frames of red-edge telegraph
        this.attackCooldown = 180;
        this.contactCooldown = 0;
        this.damage = 3;
        this.onScreenEdgeFlash = null; // set by GameEngine after construction
    }

    canAttackPlayer() {
        return !this.isDead && this.contactCooldown <= 0;
    }

    onPlayerContact() {
        this.contactCooldown = 1000;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 8;

        // Phase transition at 10 HP
        if (this.hp <= 10 && this.phase === 1) {
            this.phase = 2;
            this.speed = 2.0;
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.deathTimer = 0;
        this.vx = 0;
        this.vy = 0;
        if (this.onScreenEdgeFlash) {
            this.onScreenEdgeFlash(null); // clear flash
        }
    }

    update(player) {
        if (this.contactCooldown > 0) {
            this.contactCooldown -= 16;
        }

        if (this.isDead) {
            this.deathTimer += 16;
            if (this.deathTimer >= 800) {
                this.shouldRemove = true;
            }
            return;
        }

        if (this.chargeDuration > 0) {
            this.x += this.chargeDir.x * 10;
            this.y += this.chargeDir.y * 10;
            this.chargeDuration--;
        } else if (this.chargeWindup > 0) {
            this.chargeWindup--;
            if (this.chargeWindup === 0) {
                // Launch charge toward player's current position
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.chargeDir = { x: dx / dist, y: dy / dist };
                this.chargeDuration = 20;
                this.attackCooldown = 180;
            }
        } else {
            // Normal chase
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            if (distance > this.size) {
                this.vx = (dx / distance) * this.speed;
                this.vy = (dy / distance) * this.speed;
            }

            this.x += this.vx;
            this.y += this.vy;

            // Phase 2: initiate charge attacks
            if (this.phase === 2) {
                this.attackCooldown--;
                if (this.attackCooldown <= 0) {
                    this.chargeWindup = 50; // ~0.8s telegraph at 60fps
                    if (this.onScreenEdgeFlash) {
                        this.onScreenEdgeFlash('#dc2626');
                    }
                }
            }
        }

        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;

        const alpha = this.isDead ? Math.max(0, 1 - (this.deathTimer / 800)) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);

        if (this.hitFlash > 0) {
            ctx.filter = 'brightness(1.5)';
        }

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 14);

        ctx.restore();

        // HP bar for boss
        if (!this.isDead) {
            const bw = 100;
            const bh = 8;
            const bx = this.x - bw / 2;
            const by = this.y - this.size - 16;

            ctx.fillStyle = '#dc2626';
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);

            // Phase indicator text
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`PHASE ${this.phase}`, this.x, by - 8);
        }
    }
}
