// Particle effects for explosions, collections, etc.
export class Particle {
    constructor(x, y, emoji, angle, speed, lifetime) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = lifetime;
        this.maxLife = lifetime;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.rotation += this.rotationSpeed;
        this.life -= 16;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, 0, 5);
        ctx.restore();
    }
}