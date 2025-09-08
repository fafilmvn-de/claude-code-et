// Cat Runner Game Engine
class CatRunnerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete, victory
        this.currentLevel = 1;
        this.totalCoins = 0;
        this.levelStartTime = 0;
        this.gameTime = 0;
        this.isPaused = false;
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.coins = [];
        this.roadStripes = [];
        
        // 3D Runner settings
        this.lanes = 3; // Left, Center, Right lanes
        this.laneWidth = this.canvas.width / 3;
        this.speed = 8; // Forward movement speed
        this.perspective = 400; // 3D perspective depth
        
        // Game settings
        this.gravity = 0.8;
        this.jumpStrength = -15;
        
        // Level configurations
        this.levels = [
            {
                name: "Forest Path",
                duration: 120, // 2 minutes
                bgColor: "#90EE90",
                obstacleFreq: 0.02,
                coinFreq: 0.015,
                theme: "forest"
            },
            {
                name: "Desert Canyon",
                duration: 120,
                bgColor: "#F4A460",
                obstacleFreq: 0.025,
                coinFreq: 0.012,
                theme: "desert"
            },
            {
                name: "Ice Mountain",
                duration: 120,
                bgColor: "#B0E0E6",
                obstacleFreq: 0.03,
                coinFreq: 0.01,
                theme: "ice"
            }
        ];
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        this.setupUI();
        
        // Load saved data
        this.loadGameData();
        
        // Start game loop
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
            
            // Prevent default for game keys
            if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mobile controls
        document.getElementById('mobile-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = true;
        });
        
        document.getElementById('mobile-left').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
        });
        
        document.getElementById('mobile-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = true;
        });
        
        document.getElementById('mobile-right').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
        });
        
        document.getElementById('mobile-jump').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['Space'] = true;
        });
        
        document.getElementById('mobile-jump').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['Space'] = false;
        });
    }
    
    setupUI() {
        // Main menu buttons
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.loadGame();
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
        
        // Level complete buttons
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.exitToMenu();
        });
        
        // Game over buttons
        document.getElementById('try-again-btn').addEventListener('click', () => {
            this.restartLevel();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.exitToMenu();
        });
        
        // Victory button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startNewGame();
        });
    }
    
    startNewGame() {
        this.currentLevel = 1;
        this.totalCoins = 0;
        this.gameTime = 0;
        this.startLevel(1);
    }
    
    loadGame() {
        const savedData = localStorage.getItem('catRunnerSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentLevel = data.level;
            this.totalCoins = data.coins;
            this.gameTime = data.time;
            this.startLevel(this.currentLevel);
        } else {
            alert('No saved game found! Starting new game.');
            this.startNewGame();
        }
    }
    
    saveGameData() {
        const saveData = {
            level: this.currentLevel,
            coins: this.totalCoins,
            time: this.gameTime
        };
        localStorage.setItem('catRunnerSave', JSON.stringify(saveData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('catRunnerSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Just load the data, don't start the game
            document.getElementById('load-game-btn').style.opacity = '1';
        } else {
            document.getElementById('load-game-btn').style.opacity = '0.5';
        }
    }
    
    startLevel(levelNum) {
        this.currentLevel = levelNum;
        this.gameState = 'playing';
        this.levelStartTime = Date.now();
        
        // Show game container
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        
        // Initialize level
        this.initializeLevel();
        
        // Update UI
        this.updateUI();
    }
    
    initializeLevel() {
        const level = this.levels[this.currentLevel - 1];
        
        // Create player
        this.player = new Player(this.canvas.width, this.canvas.height);
        
        // Clear objects
        this.obstacles = [];
        this.coins = [];
        this.roadStripes = [];
        
        // Initialize road stripes for 3D effect
        this.initializeRoad();
        
        // Set canvas background
        this.canvas.style.background = `linear-gradient(to bottom, #87CEEB, ${level.bgColor})`;
    }
    
    initializeRoad() {
        // Create road stripes for 3D perspective effect
        for (let i = 0; i < 20; i++) {
            this.roadStripes.push({
                z: i * 50,
                width: 10,
                height: 3
            });
        }
    }
    
    nextLevel() {
        document.getElementById('level-complete-modal').classList.add('hidden');
        
        if (this.currentLevel < 3) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.showVictory();
        }
    }
    
    restartLevel() {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.startLevel(this.currentLevel);
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.isPaused = true;
            document.getElementById('pause-modal').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.isPaused = false;
            document.getElementById('pause-modal').classList.add('hidden');
            this.levelStartTime = Date.now() - this.gameTime;
        }
    }
    
    exitToMenu() {
        this.gameState = 'menu';
        this.isPaused = false;
        
        // Hide all modals and game container
        document.getElementById('pause-modal').classList.add('hidden');
        document.getElementById('level-complete-modal').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('victory-modal').classList.add('hidden');
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        
        // Save progress
        this.saveGameData();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update game over stats
        document.getElementById('final-coins').textContent = this.totalCoins;
        document.getElementById('final-level').textContent = this.currentLevel;
        
        // Show game over modal
        document.getElementById('game-over-modal').classList.remove('hidden');
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        
        // Play level complete sound
        if (window.soundSystem) {
            window.soundSystem.play('levelComplete');
        }
        
        // Calculate level stats
        const levelTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const levelCoins = this.totalCoins; // You might want to track coins per level
        
        // Update level complete stats
        document.getElementById('level-coins').textContent = levelCoins;
        document.getElementById('level-time').textContent = this.formatTime(levelTime);
        
        // Show level complete modal
        document.getElementById('level-complete-modal').classList.remove('hidden');
        
        // Save progress
        this.saveGameData();
    }
    
    showVictory() {
        this.gameState = 'victory';
        
        // Play victory sound
        if (window.soundSystem) {
            window.soundSystem.play('victory');
        }
        
        // Update victory stats
        document.getElementById('victory-coins').textContent = this.totalCoins;
        document.getElementById('victory-time').textContent = this.formatTime(this.gameTime);
        
        // Show victory modal
        document.getElementById('victory-modal').classList.remove('hidden');
        
        // Clear save data
        localStorage.removeItem('catRunnerSave');
    }
    
    updateUI() {
        document.getElementById('coins-display').textContent = this.totalCoins;
        document.getElementById('level-display').textContent = `Level ${this.currentLevel}`;
        
        if (this.gameState === 'playing') {
            const currentTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
            this.gameTime = currentTime;
            document.getElementById('time-display').textContent = this.formatTime(currentTime);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        if (this.player) {
            this.player.update(this.keys, this.canvas.height);
        }
        
        // Generate obstacles and coins
        this.generateObjects();
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.update();
            if (obstacle.z < -100) { // Remove obstacles that have passed behind player
                this.obstacles.splice(index, 1);
            }
        });
        
        // Update coins
        this.coins.forEach((coin, index) => {
            coin.update();
            if (coin.z < -100) { // Remove coins that have passed behind player
                this.coins.splice(index, 1);
            }
        });
        
        // Update road stripes for scrolling effect
        this.roadStripes.forEach((stripe, index) => {
            stripe.z -= this.speed;
            if (stripe.z < -50) {
                stripe.z += 1000; // Reset stripe to far distance
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Check level completion
        this.checkLevelComplete();
        
        // Update UI
        this.updateUI();
    }
    
    generateObjects() {
        const level = this.levels[this.currentLevel - 1];
        
        // Generate obstacles
        if (Math.random() < level.obstacleFreq) {
            const randomLane = Math.floor(Math.random() * 3); // 0, 1, or 2
            const obstacle = new Obstacle(
                randomLane,
                level.theme,
                this.canvas.width
            );
            this.obstacles.push(obstacle);
        }
        
        // Generate coins
        if (Math.random() < level.coinFreq) {
            const randomLane = Math.floor(Math.random() * 3); // 0, 1, or 2
            const coin = new Coin(
                randomLane,
                this.canvas.width
            );
            this.coins.push(coin);
        }
    }
    
    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.player && this.checkObstacleCollision(this.player, obstacle)) {
                if (window.soundSystem) {
                    window.soundSystem.play('gameOver');
                }
                this.gameOver();
            }
        });
        
        // Check coin collisions
        this.coins.forEach((coin, index) => {
            if (this.player && this.checkCoinCollision(this.player, coin) && !coin.collected) {
                coin.collected = true;
                this.totalCoins++;
                this.coins.splice(index, 1);
                if (window.soundSystem) {
                    window.soundSystem.play('coin');
                }
            }
        });
    }
    
    checkObstacleCollision(player, obstacle) {
        // Check if player is in same lane and obstacle is close enough
        if (player.lane !== obstacle.lane) return false;
        
        // Check z-distance (depth collision)
        const collisionDistance = 50;
        return obstacle.z > -collisionDistance && obstacle.z < collisionDistance && !player.isJumping;
    }
    
    checkCoinCollision(player, coin) {
        // Check if player is in same lane and coin is close enough
        if (player.lane !== coin.lane) return false;
        
        // Check z-distance (depth collision)  
        const collisionDistance = 60;
        return coin.z > -collisionDistance && coin.z < collisionDistance;
    }
    
    checkLevelComplete() {
        const levelDuration = this.levels[this.currentLevel - 1].duration;
        if (this.gameTime >= levelDuration) {
            this.levelComplete();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw 3D road and background
            this.draw3DRoad();
            this.drawBackground();
            
            // Draw game objects (back to front for proper 3D layering)
            // Sort obstacles and coins by z-distance for proper rendering order
            const allObjects = [...this.obstacles, ...this.coins];
            allObjects.sort((a, b) => b.z - a.z); // Far to near
            
            // Draw objects
            allObjects.forEach(obj => {
                if (obj instanceof Obstacle) {
                    obj.draw(this.ctx, this.canvas.height, this.perspective);
                } else if (obj instanceof Coin) {
                    obj.draw(this.ctx, this.canvas.height, this.perspective);
                }
            });
            
            // Draw player last (always on top)
            if (this.player) this.player.draw(this.ctx);
            
            // Draw pause overlay
            if (this.gameState === 'paused') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = '48px Fredoka One';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            }
        }
    }
    
    draw3DRoad() {
        const roadY = this.canvas.height - 120;
        const roadHeight = 120;
        
        // Draw road surface
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(0, roadY, this.canvas.width, roadHeight);
        
        // Draw lane dividers
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        
        // Left lane divider
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 3, roadY);
        this.ctx.lineTo(this.canvas.width / 3, this.canvas.height);
        this.ctx.stroke();
        
        // Right lane divider  
        this.ctx.beginPath();
        this.ctx.moveTo((this.canvas.width / 3) * 2, roadY);
        this.ctx.lineTo((this.canvas.width / 3) * 2, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]); // Reset line dash
        
        // Draw road stripes for 3D depth effect
        this.roadStripes.forEach(stripe => {
            const scale = this.perspective / (this.perspective + stripe.z);
            if (scale > 0) {
                const stripeY = roadY + (roadHeight / 2) - (stripe.height * scale / 2);
                const stripeWidth = this.canvas.width * scale;
                const stripeX = (this.canvas.width - stripeWidth) / 2;
                
                this.ctx.fillStyle = '#666666';
                this.ctx.fillRect(stripeX, stripeY, stripeWidth, stripe.height * scale);
            }
        });
    }
    
    drawBackground() {
        const level = this.levels[this.currentLevel - 1];
        
        // Draw simple background elements based on theme
        this.ctx.fillStyle = level.bgColor;
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Add theme-specific background elements
        if (level.theme === 'forest') {
            this.drawTrees();
        } else if (level.theme === 'desert') {
            this.drawCactus();
        } else if (level.theme === 'ice') {
            this.drawSnow();
        }
    }
    
    drawTrees() {
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + this.gameTime * 0.5) % (this.canvas.width + 100);
            this.ctx.fillRect(x - 10, this.canvas.height - 150, 20, 100);
            
            this.ctx.fillStyle = '#32CD32';
            this.ctx.beginPath();
            this.ctx.arc(x, this.canvas.height - 150, 30, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#228B22';
        }
    }
    
    drawCactus() {
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 3; i++) {
            const x = (i * 300 + this.gameTime * 0.3) % (this.canvas.width + 100);
            this.ctx.fillRect(x - 8, this.canvas.height - 120, 16, 70);
            this.ctx.fillRect(x - 20, this.canvas.height - 90, 12, 30);
            this.ctx.fillRect(x + 8, this.canvas.height - 80, 12, 20);
        }
    }
    
    drawSnow() {
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 20; i++) {
            const x = (i * 40 + this.gameTime * 2) % (this.canvas.width + 20);
            const y = (i * 13 + this.gameTime) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Player class for 3D runner
class Player {
    constructor(canvasWidth, canvasHeight) {
        this.lane = 1; // 0 = left, 1 = center, 2 = right
        this.targetLane = 1;
        this.laneWidth = canvasWidth / 3;
        this.x = this.laneWidth + this.laneWidth / 2; // Start in center lane
        this.y = canvasHeight - 120; // Fixed Y position (ground level)
        this.z = 0; // Depth position (for 3D effect)
        
        this.width = 60;
        this.height = 80;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        
        // Lane switching animation
        this.laneChangeSpeed = 12;
        this.isChangingLanes = false;
        
        // Animation
        this.runFrame = 0;
        this.runSpeed = 0.3;
        
        // Ground level
        this.groundY = canvasHeight - 120;
    }
    
    update(keys, canvasHeight) {
        // Handle lane switching
        if (keys['ArrowLeft'] && this.lane > 0 && !this.isChangingLanes) {
            this.lane--;
            this.targetLane = this.lane;
            this.isChangingLanes = true;
        }
        if (keys['ArrowRight'] && this.lane < 2 && !this.isChangingLanes) {
            this.lane++;
            this.targetLane = this.lane;
            this.isChangingLanes = true;
        }
        
        // Smooth lane transition
        const targetX = this.laneWidth * this.targetLane + this.laneWidth / 2;
        if (this.isChangingLanes) {
            const dx = targetX - this.x;
            if (Math.abs(dx) > 3) {
                this.x += dx > 0 ? this.laneChangeSpeed : -this.laneChangeSpeed;
            } else {
                this.x = targetX;
                this.isChangingLanes = false;
            }
        }
        
        // Jumping
        if (keys['Space'] && this.isGrounded) {
            this.velocityY = -15; // Jump strength
            this.isGrounded = false;
            this.isJumping = true;
            if (window.soundSystem) {
                window.soundSystem.play('jump');
            }
        }
        
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += 0.8;
            this.y += this.velocityY;
            
            // Ground collision
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isJumping = false;
            }
        }
        
        // Update running animation
        this.runFrame += this.runSpeed;
        if (this.runFrame >= 4) this.runFrame = 0;
    }
    
    draw(ctx) {
        // Draw simple cat character
        const frame = Math.floor(this.runFrame);
        const bounce = this.isGrounded ? Math.sin(this.runFrame * Math.PI) * 2 : 0;
        
        // Body (orange cat)
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x, this.y + bounce, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 10 + bounce, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y - 15 + bounce);
        ctx.lineTo(this.x + 15, this.y - 25 + bounce);
        ctx.lineTo(this.x + 20, this.y - 10 + bounce);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y - 15 + bounce);
        ctx.lineTo(this.x + 25, this.y - 25 + bounce);
        ctx.lineTo(this.x + 35, this.y - 10 + bounce);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y - 12 + bounce, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 28, this.y - 12 + bounce, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail (animated)
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 8;
        ctx.beginPath();
        const tailWave = Math.sin(this.runFrame * 2) * 10;
        ctx.moveTo(this.x, this.y + 20 + bounce);
        ctx.quadraticCurveTo(this.x - 20, this.y - 10 + tailWave + bounce, this.x - 30, this.y + 5 + bounce);
        ctx.stroke();
        
        // Running legs animation
        ctx.fillStyle = '#FF8C00';
        const legOffset = Math.sin(this.runFrame * Math.PI * 2) * 3;
        ctx.fillRect(this.x + 8, this.y + this.height + bounce, 6, 8 + legOffset);
        ctx.fillRect(this.x + 26, this.y + this.height + bounce, 6, 8 - legOffset);
    }
}

// Obstacle class for 3D runner
class Obstacle {
    constructor(lane, theme = 'forest', canvasWidth) {
        this.lane = lane; // 0, 1, or 2
        this.laneWidth = canvasWidth / 3;
        this.x = this.laneWidth * lane + this.laneWidth / 2;
        this.z = 1000; // Start far in the distance
        this.width = 40;
        this.height = 60;
        this.theme = theme;
        this.speed = 8; // How fast it approaches
    }
    
    update() {
        this.z -= this.speed; // Move towards the player
    }
    
    // Calculate screen position based on 3D perspective
    getScreenPosition(canvasHeight, perspective = 400) {
        if (this.z <= 0) return null; // Behind the camera
        
        const scale = perspective / (perspective + this.z);
        const screenY = canvasHeight - 120 - (this.height * scale);
        
        return {
            x: this.x - (this.width * scale) / 2,
            y: screenY,
            width: this.width * scale,
            height: this.height * scale,
            scale: scale
        };
    }
    
    draw(ctx, canvasHeight, perspective = 400) {
        const screenPos = this.getScreenPosition(canvasHeight, perspective);
        if (!screenPos) return; // Don't draw if behind camera
        
        const { x, y, width, height, scale } = screenPos;
        
        if (this.theme === 'forest') {
            // Tree stump - scaled for 3D perspective
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + width * 0.1, y, width * 0.8, height * 0.15);
        } else if (this.theme === 'desert') {
            // Rock - scaled for 3D perspective
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + width * 0.15, y + height * 0.2, width * 0.7, height * 0.6);
        } else if (this.theme === 'ice') {
            // Ice spike - scaled for 3D perspective
            ctx.fillStyle = '#B0E0E6';
            ctx.beginPath();
            ctx.moveTo(x + width/2, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.moveTo(x + width/2, y + height * 0.2);
            ctx.lineTo(x + width * 0.2, y + height);
            ctx.lineTo(x + width * 0.8, y + height);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// Coin class for 3D runner
class Coin {
    constructor(lane, canvasWidth) {
        this.lane = lane;
        this.laneWidth = canvasWidth / 3;
        this.x = this.laneWidth * lane + this.laneWidth / 2;
        this.z = 1000; // Start far in the distance
        this.width = 25;
        this.height = 25;
        this.collected = false;
        this.rotation = 0;
        this.bob = 0;
        this.speed = 8;
        this.floatHeight = 60; // Height above ground
    }
    
    update() {
        this.z -= this.speed; // Move towards player
        this.rotation += 0.15;
        this.bob += 0.12;
    }
    
    // Calculate screen position based on 3D perspective
    getScreenPosition(canvasHeight, perspective = 400) {
        if (this.z <= 0) return null; // Behind the camera
        
        const scale = perspective / (perspective + this.z);
        const bobOffset = Math.sin(this.bob) * 5 * scale;
        const screenY = canvasHeight - 120 - this.floatHeight * scale + bobOffset;
        
        return {
            x: this.x,
            y: screenY,
            width: this.width * scale,
            height: this.height * scale,
            scale: scale
        };
    }
    
    draw(ctx, canvasHeight, perspective = 400) {
        if (this.collected) return;
        
        const screenPos = this.getScreenPosition(canvasHeight, perspective);
        if (!screenPos) return; // Don't draw if behind camera
        
        const { x, y, scale } = screenPos;
        const radius = 12 * scale;
        
        // Draw coin with rotation effect
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        
        // Outer ring
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CatRunnerGame();
});