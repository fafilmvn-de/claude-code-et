// Cat Hero player class
export class CatHero {
    constructor(x, y, images) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3; // Reduced from 5 to 3 for better control
        this.size = 40;
        this.images = images;
        this.currentAction = 'act_1';
        this.animationTime = 0;
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.isDead = false;
    }
    
    update(keys, worldWidth, worldHeight) {
        if (this.isDead) return;
        
        this.animationTime += 0.1;
        
        // Handle movement
        let moveX = 0;
        let moveY = 0;
        
        if (keys['ArrowLeft'] || keys['KeyA']) moveX -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) moveX += 1;
        if (keys['ArrowUp'] || keys['KeyW']) moveY -= 1;
        if (keys['ArrowDown'] || keys['KeyS']) moveY += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        // Apply movement
        this.vx = moveX * this.speed;
        this.vy = moveY * this.speed;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep within world bounds
        this.x = Math.max(this.size, Math.min(worldWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(worldHeight - this.size, this.y));
        
        // Update animation
        if (this.isAttacking) {
            this.attackAnimationTime += 16;
            this.currentAction = 'act_2'; // Attack animation
            
            if (this.attackAnimationTime >= 300) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
            }
        } else if (moveX !== 0 || moveY !== 0) {
            // Alternate between act_2 and act_3 for walking
            this.currentAction = Math.floor(this.animationTime * 5) % 2 === 0 ? 'act_2' : 'act_3';
        } else {
            this.currentAction = 'act_1'; // Idle
        }
    }
    
    startAttack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }
    
    takeDamage() {
        // This will be handled by the game class
    }
    
    die() {
        this.isDead = true;
        this.currentAction = 'die_1';
    }
    
    render(ctx) {
        const imageName = `avt_${this.currentAction}`;
        const image = this.images[imageName];
        
        if (image) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Proper sprite size - 2.5x emoji size (emojis ~20px, so 50px)
            const targetSize = 50; // 2.5x emoji size
            const scale = targetSize / Math.max(image.width, image.height);
            ctx.scale(scale, scale);
            
            // Draw image centered
            ctx.drawImage(image, -image.width/2, -image.height/2);
            
            ctx.restore();
        } else {
            // Fallback to emoji if image not loaded - DOUBLED size
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.font = '50px Arial'; // 2.5x emoji size
            ctx.textAlign = 'center';
            ctx.fillText('🐱', 0, 18); // Proper Y offset
            ctx.restore();
        }
    }
}