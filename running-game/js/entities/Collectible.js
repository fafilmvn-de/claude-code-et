// Collectible items (yarn, butterflies, fish treats)
export class Collectible {
    constructor(x, y, type, emoji) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.emoji = emoji;
        this.collected = false;
        this.animationTime = Math.random() * 6.28;
        this.bouncePhase = Math.random() * 6.28;
    }
    
    update() {
        this.animationTime += 0.05;
        this.bouncePhase += 0.1;
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const float = Math.sin(this.animationTime * 3) * 5;
        ctx.translate(0, float);
        
        const sparkle = 1 + Math.sin(this.animationTime * 6) * 0.2;
        ctx.scale(sparkle, sparkle);
        
        ctx.font = '25px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, 0, 8);
        
        // Add glow effect
        ctx.shadowColor = this.type === 'yarn' ? '#FFD700' : 
                         this.type === 'butterfly' ? '#FF69B4' : '#00BFFF';
        ctx.shadowBlur = 10;
        ctx.fillText(this.emoji, 0, 8);
        
        ctx.restore();
    }
}