// Cat's Backyard Adventure - Top View Game Engine
class BackyardAdventure {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, levelComplete, victory
        this.currentLevel = 1;
        this.gameTime = 0;
        this.levelStartTime = 0;
        this.isPaused = false;
        
        // Collections
        this.yarnBalls = 0;
        this.butterflies = 0;
        this.fishTreats = 0;
        this.totalYarn = 0;
        this.totalButterflies = 0;
        this.totalFish = 0;
        
        // Game objects
        this.player = null;
        this.collectibles = [];
        this.environment = [];
        this.particles = [];
        
        // World settings
        this.worldWidth = 1600;
        this.worldHeight = 1200;
        this.camera = { x: 0, y: 0 };
        
        // Level configurations
        this.levels = [
            {
                name: "Garden Paradise",
                bgColor: "#7CB342",
                targetYarn: 8,
                targetButterflies: 5,
                targetFish: 3,
                theme: "garden",
                description: "Explore the sunny garden!"
            },
            {
                name: "Flower Meadow",
                bgColor: "#66BB6A",
                targetYarn: 10,
                targetButterflies: 8,
                targetFish: 5,
                theme: "meadow",
                description: "Chase butterflies in the meadow!"
            },
            {
                name: "Fish Pond Adventure",
                bgColor: "#42A5F5",
                targetYarn: 12,
                targetButterflies: 10,
                targetFish: 8,
                theme: "pond",
                description: "Catch fish by the magical pond!"
            }
        ];
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.targetPos = null;
        
        this.setupEventListeners();
        this.setupUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Escape') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse/touch events for click-to-move
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Convert screen coordinates to world coordinates
                const worldX = x + this.camera.x;
                const worldY = y + this.camera.y;
                
                this.targetPos = { x: worldX, y: worldY };
                this.createClickEffect(x, y);
            }
        });
        
        // Mobile controls
        const setupMobileButton = (id, key) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                });
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                });
                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
            }
        };
        
        setupMobileButton('mobile-up', 'ArrowUp');
        setupMobileButton('mobile-down', 'ArrowDown');
        setupMobileButton('mobile-left', 'ArrowLeft');
        setupMobileButton('mobile-right', 'ArrowRight');
    }
    
    setupUI() {
        // Main menu
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('instructions-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.remove('hidden');
        });
        
        document.getElementById('close-instructions-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.add('hidden');
        });
        
        // Game controls
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('exit-game-btn').addEventListener('click', () => {
            this.exitToMenu();
        });
        
        // Level complete
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.exitToMenu();
        });
        
        // Victory
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startNewGame();
        });
    }
    
    startNewGame() {
        this.currentLevel = 1;
        this.totalYarn = 0;
        this.totalButterflies = 0;
        this.totalFish = 0;
        this.gameTime = 0;
        this.startLevel();
    }
    
    startLevel() {
        this.gameState = 'playing';
        this.levelStartTime = Date.now();
        this.yarnBalls = 0;
        this.butterflies = 0;
        this.fishTreats = 0;
        
        // Show game container
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        
        // Initialize game world
        this.initializeLevel();
        this.updateUI();
    }
    
    initializeLevel() {
        const level = this.levels[this.currentLevel - 1];
        
        // Create player
        this.player = new Cat(this.worldWidth / 2, this.worldHeight / 2);
        
        // Clear arrays
        this.collectibles = [];
        this.environment = [];
        this.particles = [];
        
        // Create environment
        this.createEnvironment(level.theme);
        
        // Create collectibles
        this.createCollectibles(level);
        
        // Center camera on player
        this.updateCamera();
    }
    
    createEnvironment(theme) {
        // Add decorative environment elements
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            if (theme === 'garden') {
                this.environment.push(new EnvironmentItem(x, y, 'flower', '🌸'));
            } else if (theme === 'meadow') {
                this.environment.push(new EnvironmentItem(x, y, 'flower', '🌼'));
            } else if (theme === 'pond') {
                this.environment.push(new EnvironmentItem(x, y, 'lily', '🪷'));
            }
        }
        
        // Add trees and bushes
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            this.environment.push(new EnvironmentItem(x, y, 'tree', '🌳'));
        }
        
        // Add paths
        this.createPaths();
    }
    
    createPaths() {
        // Create winding paths throughout the world
        const pathPoints = [
            { x: 100, y: 100 },
            { x: 400, y: 300 },
            { x: 800, y: 200 },
            { x: 1200, y: 400 },
            { x: 1400, y: 800 },
            { x: 1000, y: 1000 },
            { x: 600, y: 1100 },
            { x: 200, y: 900 }
        ];
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const start = pathPoints[i];
            const end = pathPoints[i + 1];
            
            // Create path segments
            const segments = 20;
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const x = start.x + (end.x - start.x) * t + (Math.random() - 0.5) * 50;
                const y = start.y + (end.y - start.y) * t + (Math.random() - 0.5) * 50;
                this.environment.push(new EnvironmentItem(x, y, 'path', '🪨'));
            }
        }
    }
    
    createCollectibles(level) {
        // Create yarn balls
        for (let i = 0; i < level.targetYarn; i++) {
            const x = Math.random() * (this.worldWidth - 100) + 50;
            const y = Math.random() * (this.worldHeight - 100) + 50;
            this.collectibles.push(new Collectible(x, y, 'yarn', '🧶'));
        }
        
        // Create butterflies (moving)
        for (let i = 0; i < level.targetButterflies; i++) {
            const x = Math.random() * (this.worldWidth - 100) + 50;
            const y = Math.random() * (this.worldHeight - 100) + 50;
            this.collectibles.push(new Collectible(x, y, 'butterfly', '🦋', true));
        }
        
        // Create fish treats
        for (let i = 0; i < level.targetFish; i++) {
            const x = Math.random() * (this.worldWidth - 100) + 50;
            const y = Math.random() * (this.worldHeight - 100) + 50;
            this.collectibles.push(new Collectible(x, y, 'fish', '🐟'));
        }
    }
    
    createClickEffect(x, y) {
        // Create sparkle effect where user clicked
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x + this.camera.x, 
                y + this.camera.y, 
                '✨', 
                Math.random() * 6.28, 
                2 + Math.random() * 3,
                1000
            ));
        }
    }
    
    createCollectionEffect(x, y, type) {
        // Create celebration effect when collecting items
        const emoji = type === 'yarn' ? '🎉' : type === 'butterfly' ? '⭐' : '💫';
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                x, y, emoji, 
                Math.random() * 6.28, 
                3 + Math.random() * 4,
                1500
            ));
        }
        
        // Show celebration message
        this.showCelebrationMessage(type);
    }
    
    showCelebrationMessage(type) {
        const messages = {
            'yarn': ['Great catch! 🧶', 'Yarn ball get! 🎉', 'So fun! 😸'],
            'butterfly': ['Butterfly caught! 🦋', 'Amazing! ⭐', 'So pretty! 😍'],
            'fish': ['Yummy fish! 🐟', 'Delicious! 😋', 'Tasty treat! 💖']
        };
        
        const messageList = messages[type];
        const message = messageList[Math.floor(Math.random() * messageList.length)];
        
        const messageEl = document.getElementById('celebration-message');
        messageEl.textContent = message;
        messageEl.classList.remove('hidden');
        
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 2000);
    }
    
    updateCamera() {
        // Center camera on player with smooth following
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update game time
        this.gameTime = Date.now() - this.levelStartTime;
        
        // Update player
        this.player.update(this.keys, this.targetPos, this.worldWidth, this.worldHeight);
        
        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update();
            
            // Check collision with player
            const dx = collectible.x - this.player.x;
            const dy = collectible.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30 && !collectible.collected) {
                collectible.collected = true;
                this.collectItem(collectible);
                this.createCollectionEffect(collectible.x, collectible.y, collectible.type);
            }
        });
        
        // Remove collected items
        this.collectibles = this.collectibles.filter(item => !item.collected);
        
        // Update particles
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Update camera
        this.updateCamera();
        
        // Check level completion
        this.checkLevelComplete();
        
        // Update UI
        this.updateUI();
    }
    
    collectItem(collectible) {
        if (collectible.type === 'yarn') {
            this.yarnBalls++;
            this.totalYarn++;
        } else if (collectible.type === 'butterfly') {
            this.butterflies++;
            this.totalButterflies++;
        } else if (collectible.type === 'fish') {
            this.fishTreats++;
            this.totalFish++;
        }
        
        // Play collection sound
        if (window.playCollectSound) {
            window.playCollectSound();
        }
    }
    
    checkLevelComplete() {
        const level = this.levels[this.currentLevel - 1];
        const totalItems = this.yarnBalls + this.butterflies + this.fishTreats;
        const targetItems = level.targetYarn + level.targetButterflies + level.targetFish;
        
        if (totalItems >= targetItems) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        
        // Update level complete UI
        document.getElementById('level-yarn').textContent = this.yarnBalls;
        document.getElementById('level-butterflies').textContent = this.butterflies;
        document.getElementById('level-fish').textContent = this.fishTreats;
        document.getElementById('level-time').textContent = this.formatTime(this.gameTime);
        
        // Show modal
        document.getElementById('level-complete-modal').classList.remove('hidden');
        
        // Play level complete sound
        if (window.playLevelCompleteSound) {
            window.playLevelCompleteSound();
        }
    }
    
    nextLevel() {
        document.getElementById('level-complete-modal').classList.add('hidden');
        
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            this.startLevel();
        } else {
            this.showVictory();
        }
    }
    
    showVictory() {
        this.gameState = 'victory';
        
        // Update victory UI
        document.getElementById('victory-yarn').textContent = this.totalYarn;
        document.getElementById('victory-butterflies').textContent = this.totalButterflies;
        document.getElementById('victory-fish').textContent = this.totalFish;
        document.getElementById('victory-time').textContent = this.formatTime(this.gameTime);
        
        // Show modal
        document.getElementById('victory-modal').classList.remove('hidden');
        
        // Play victory sound
        if (window.playVictorySound) {
            window.playVictorySound();
        }
    }
    
    updateUI() {
        document.getElementById('yarn-display').textContent = this.yarnBalls;
        document.getElementById('butterfly-display').textContent = this.butterflies;
        document.getElementById('fish-display').textContent = this.fishTreats;
        document.getElementById('time-display').textContent = this.formatTime(this.gameTime);
        
        // Update progress bar
        if (this.currentLevel <= this.levels.length) {
            const level = this.levels[this.currentLevel - 1];
            const totalItems = this.yarnBalls + this.butterflies + this.fishTreats;
            const targetItems = level.targetYarn + level.targetButterflies + level.targetFish;
            const progress = Math.min(100, (totalItems / targetItems) * 100);
            
            document.getElementById('progress-bar').style.width = progress + '%';
            document.getElementById('progress-text').textContent = 
                `${totalItems}/${targetItems} items collected - ${level.name}`;
        }
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-modal').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pause-modal').classList.add('hidden');
        }
    }
    
    exitToMenu() {
        this.gameState = 'menu';
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('pause-modal').classList.add('hidden');
        document.getElementById('level-complete-modal').classList.add('hidden');
        document.getElementById('victory-modal').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.currentLevel <= this.levels.length ? 
            this.levels[this.currentLevel - 1].bgColor : '#7CB342';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render environment
        this.environment.forEach(item => item.render(this.ctx));
        
        // Render collectibles
        this.collectibles.forEach(item => item.render(this.ctx));
        
        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (world coordinates)
        if (this.targetPos) {
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(this.targetPos.x, this.targetPos.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎯', this.targetPos.x, this.targetPos.y + 7);
            this.ctx.restore();
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Cat player class
class Cat {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
        this.size = 20;
        this.emoji = '🐱';
        this.direction = 0;
        this.animationTime = 0;
        this.targetReached = true;
    }
    
    update(keys, targetPos, worldWidth, worldHeight) {
        this.animationTime += 0.1;
        
        // Handle keyboard movement
        let moveX = 0;
        let moveY = 0;
        
        if (keys['ArrowLeft'] || keys['KeyA']) moveX -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) moveX += 1;
        if (keys['ArrowUp'] || keys['KeyW']) moveY -= 1;
        if (keys['ArrowDown'] || keys['KeyS']) moveY += 1;
        
        // Handle click-to-move
        if (targetPos && !this.targetReached) {
            const dx = targetPos.x - this.x;
            const dy = targetPos.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                moveX = dx / distance;
                moveY = dy / distance;
            } else {
                this.targetReached = true;
                targetPos = null;
            }
        }
        
        // Set new target if clicked
        if (targetPos && this.targetReached) {
            this.targetReached = false;
        }
        
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
        
        // Update direction for animation
        if (this.vx !== 0 || this.vy !== 0) {
            this.direction = Math.atan2(this.vy, this.vx);
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Add bounce animation when moving
        const bounce = Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1 ? 
            Math.sin(this.animationTime * 10) * 2 : 0;
        ctx.translate(0, bounce);
        
        // Scale for cute effect
        const scale = 1 + Math.sin(this.animationTime * 5) * 0.1;
        ctx.scale(scale, scale);
        
        // Draw cat
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, 0, 10);
        
        // Add shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 15, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Collectible items
class Collectible {
    constructor(x, y, type, emoji, moving = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.emoji = emoji;
        this.moving = moving;
        this.collected = false;
        this.animationTime = Math.random() * 6.28;
        this.moveAngle = Math.random() * 6.28;
        this.moveSpeed = moving ? 1 + Math.random() : 0;
        this.bouncePhase = Math.random() * 6.28;
    }
    
    update() {
        this.animationTime += 0.05;
        this.bouncePhase += 0.1;
        
        if (this.moving) {
            // Butterfly movement pattern
            this.moveAngle += (Math.random() - 0.5) * 0.2;
            this.x += Math.cos(this.moveAngle) * this.moveSpeed;
            this.y += Math.sin(this.moveAngle) * this.moveSpeed + Math.sin(this.bouncePhase) * 0.5;
            
            // Keep butterflies in reasonable bounds
            if (this.x < 50 || this.x > 1550) this.moveAngle = Math.PI - this.moveAngle;
            if (this.y < 50 || this.y > 1150) this.moveAngle = -this.moveAngle;
        }
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Floating animation
        const float = Math.sin(this.animationTime * 3) * 5;
        ctx.translate(0, float);
        
        // Sparkle effect
        const sparkle = 1 + Math.sin(this.animationTime * 6) * 0.2;
        ctx.scale(sparkle, sparkle);
        
        // Draw item
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

// Environment decorations
class EnvironmentItem {
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
            // Gentle sway for flowers
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

// Particle effects
class Particle {
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

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new BackyardAdventure();
});