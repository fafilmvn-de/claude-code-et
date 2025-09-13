// Weapon Blast effect for special attacks
export class WeaponBlast {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 200;
        this.life = 1000;
        this.maxLife = 1000;
    }
    
    update() {
        this.life -= 16;
        this.radius = ((this.maxLife - this.life) / this.maxLife) * this.maxRadius;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = alpha;
        
        // Draw expanding circle
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner blast
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}