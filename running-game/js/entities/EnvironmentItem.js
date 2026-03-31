// Environment decorations (flowers, trees, rocks, etc.)
export class EnvironmentItem {
    constructor(x, y, type, emoji) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.emoji = emoji;
        this.animationTime = Math.random() * 6.28;
        this.scale = 0.8 + Math.random() * 0.4;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        if (this.type === 'flower') {
            const sway = Math.sin(this.animationTime * 0.5) * 0.1;
            ctx.rotate(sway);
        }
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, 0, 6);
        
        ctx.restore();
        
        this.animationTime += 0.01;
    }
}