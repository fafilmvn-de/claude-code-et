// GiantBug enemy - slow (1.2), tanky (3 HP), deals 2 damage, spawns in pairs
export class GiantBug {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1.2;
        this.size = 40;
        this.maxHP = 3;
        this.currentHP = 3;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🐛';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.contactCooldown = 0;
        this.damage = 2;
    }

    canAttackPlayer() {
        return !this.isDead && this.contactCooldown <= 0;
    }

    onPlayerContact() {
        this.contactCooldown = 2000;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.currentHP -= amount;
        this.hitFlash = 8;
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.deathTimer = 0;
        this.vx = 0;
        this.vy = 0;
    }

    update(player) {
        if (this.contactCooldown > 0) {
            this.contactCooldown -= 16;
        }

        if (this.isDead) {
            this.deathTimer += 16;
            if (this.deathTimer >= 500) {
                this.shouldRemove = true;
            }
            return;
        }

        // Chase player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (distance > this.size) {
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;

        const alpha = this.isDead ? Math.max(0, 1 - (this.deathTimer / 500)) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);

        if (this.hitFlash > 0) {
            ctx.filter = 'brightness(1.5)';
        }

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 10);

        ctx.restore();

        // HP bar for tanky enemies
        if (!this.isDead) {
            const bw = 50;
            const bh = 6;
            const bx = this.x - bw / 2;
            const by = this.y - this.size - 12;

            ctx.fillStyle = '#dc2626';
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(bx, by, bw * (this.currentHP / this.maxHP), bh);
        }
    }
}
