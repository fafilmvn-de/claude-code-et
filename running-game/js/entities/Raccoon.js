// Raccoon enemy - steals 2 coins on contact; deals no HP damage
export class Raccoon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 2.2;
        this.size = 28;
        this.maxHp = 1;
        this.hp = 1;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🦝';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.contactCooldown = 0;
        this.coinsStolen = 0; // Track coins stolen per encounter
    }

    canAttackPlayer() {
        return !this.isDead && this.contactCooldown <= 0;
    }

    onPlayerContact() {
        this.coinsStolen = 2;
        this.contactCooldown = 2000; // 2 second cooldown between steals
    }

    // Returns true if coins should be stolen; caller deducts coins
    trySteaCoins() {
        if (this.coinsStolen > 0) {
            const coins = this.coinsStolen;
            this.coinsStolen = 0;
            return coins;
        }
        return 0;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 6;
        if (this.hp <= 0) {
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
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
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
    }
}
