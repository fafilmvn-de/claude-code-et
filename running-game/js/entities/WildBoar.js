// Wild Boar enemy class
export class WildBoar {
    constructor(x, y, images) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1.5; // Reduced from 2 to 1.5 for better gameplay
        this.size = 35;
        this.images = images;
        this.type = 'boar';
        this.maxHP = 1;
        this.currentHP = 1;
        this.isDead = false;
        this.shouldRemove = false;
        this.currentAction = 'act_1';
        this.animationTime = 0;
        this.deathTimer = 0;
        this.contactCooldown = 0;
    }
    
    update(player) {
        this.animationTime += 0.1;
        
        if (this.contactCooldown > 0) {
            this.contactCooldown -= 16;
        }
        
        if (this.isDead) {
            this.deathTimer += 16;
            if (this.deathTimer >= 1000) { // Remove after 1 second
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
        
        // Animate
        this.currentAction = Math.floor(this.animationTime * 3) % 2 === 0 ? 'act_1' : 'act_2';
    }
    
    takeDamage(amount) {
        this.currentHP -= amount;
        if (this.currentHP <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        this.currentAction = 'die_1';
        this.vx = 0;
        this.vy = 0;
    }
    
    canAttackPlayer() {
        return this.contactCooldown <= 0;
    }
    
    onPlayerContact() {
        this.contactCooldown = 2000; // 2 second cooldown - gives player time to react
    }
    
    render(ctx) {
        const imageName = `boar_${this.currentAction}`;
        const image = this.images[imageName];
        
        if (image) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Proper sprite size - 2x emoji size (emojis ~20px, so 40px) 
            const targetSize = 40; // 2x emoji size
            const scale = targetSize / Math.max(image.width, image.height);
            ctx.scale(scale, scale);
            
            // Fade out when dying
            if (this.isDead) {
                ctx.globalAlpha = 1 - (this.deathTimer / 1000);
            }
            
            ctx.drawImage(image, -image.width/2, -image.height/2);
            
            ctx.restore();
        } else {
            // Fallback - DOUBLED size
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.font = '40px Arial'; // 2x emoji size
            ctx.textAlign = 'center';
            ctx.fillText('🐗', 0, 14); // Proper Y offset
            ctx.restore();
        }
    }
}