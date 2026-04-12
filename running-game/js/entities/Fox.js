// Fox enemy - dashes toward player every 4s with 1s orange-flash telegraph
export class Fox {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 2.8;
        this.size = 30;
        this.maxHp = 2;
        this.hp = 2;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🦊';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.dashCooldown = 240; // frames until next dash attempt
        this.telegraphTimer = 0; // frames of orange-flash warning
        this.dashing = false;
        this.dashVx = 0;
        this.dashVy = 0;
        this.dashDuration = 0;
        this.contactCooldown = 0;
    }

    canAttackPlayer() {
        return !this.isDead && this.contactCooldown <= 0;
    }

    onPlayerContact() {
        this.contactCooldown = 1500;
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

        if (this.dashing) {
            this.x += this.dashVx;
            this.y += this.dashVy;
            this.dashDuration--;
            if (this.dashDuration <= 0) {
                this.dashing = false;
            }
        } else if (this.telegraphTimer > 0) {
            // Flash and wait, then launch dash
            this.telegraphTimer--;
            if (this.telegraphTimer === 0) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.dashVx = (dx / dist) * 14;
                this.dashVy = (dy / dist) * 14;
                this.dashing = true;
                this.dashDuration = 15;
                this.dashCooldown = 240;
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

            this.dashCooldown--;
            if (this.dashCooldown <= 0) {
                this.telegraphTimer = 60; // 1s warning at 60fps
            }
        }

        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;

        const alpha = this.isDead ? Math.max(0, 1 - (this.deathTimer / 500)) : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);

        // Orange telegraph pulse
        if (this.telegraphTimer > 0) {
            ctx.globalAlpha = alpha * (0.4 + 0.6 * Math.abs(Math.sin(this.telegraphTimer * 0.3)));
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = alpha;
        }

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
