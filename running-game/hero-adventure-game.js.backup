// Cat Hero's Backyard Adventure - Action RPG Game Engine
class HeroAdventureGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Enable image smoothing for better sprite rendering
        this.ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete, victory
        this.currentLevel = 1;
        this.gameTime = 0;
        this.levelStartTime = 0;
        this.isPaused = false;
        
        // Player stats
        this.maxHP = 5;
        this.currentHP = 5;
        this.attackRange = 4; // Increased from 2 to make game easier
        this.killStreak = 0;
        this.totalKills = 0;
        this.weaponBlastReady = false;
        
        // Collections and power-ups
        this.yarnBalls = 0;
        this.butterflies = 0;
        this.fishTreats = 0;
        this.shieldHP = 0;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.collectibles = [];
        this.environment = [];
        this.particles = [];
        this.weaponEffects = [];
        
        // World settings
        this.worldWidth = 1600;
        this.worldHeight = 1200;
        this.camera = { x: 0, y: 0 };
        
        // Enemy spawn system
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 5000; // 5 seconds base delay (balanced)
        this.enemiesKilled = 0;
        this.playerInvulnerable = false;
        this.invulnerabilityTimer = 0;
        
        // Level configurations
        this.levels = [
            {
                name: "Boar Invasion",
                bgColor: "#7CB342",
                totalBoars: 20,
                totalWolves: 0,
                targetKills: 20,
                theme: "garden",
                description: "Defend the garden from wild boars!"
            },
            {
                name: "Wolf Pack Attack",
                bgColor: "#66BB6A", 
                totalBoars: 30,
                totalWolves: 5,
                targetKills: 35,
                theme: "forest",
                description: "Face the fierce wolf pack!"
            },
            {
                name: "Final Battle",
                bgColor: "#42A5F5",
                totalBoars: 40,
                totalWolves: 10,
                targetKills: 50,
                theme: "battlefield",
                description: "The ultimate showdown!"
            }
        ];
        
        // Image loading
        this.images = {};
        this.imagesLoaded = 0;
        this.totalImages = 0;
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isAttacking = false;
        this.attackCooldown = 0;
        
        this.loadImages();
        this.setupEventListeners();
        this.setupUI();
        
        // Fallback timeout in case images don't load
        setTimeout(() => {
            if (this.imagesLoaded < this.totalImages) {
                console.warn(`Only ${this.imagesLoaded}/${this.totalImages} images loaded after timeout, starting anyway`);
                this.startGameLoop();
            }
        }, 10000); // 10 second timeout
    }
    
    loadImages() {
        const imageFiles = [
            'avt_act_1.png', 'avt_act_2.png', 'avt_act_3.png', 'avt_die_1.png',
            'boar_act_1.png', 'boar_act_2.png', 'boar_die_1.png',
            'wolf_act_1.png', 'wolf_act_2.png', 'wolf_die_1.png'
        ];
        
        this.totalImages = imageFiles.length;
        
        imageFiles.forEach(filename => {
            const img = new Image();
            img.onload = () => {
                console.log(`Loaded: ${filename}`);
                this.imagesLoaded++;
                if (this.imagesLoaded === this.totalImages) {
                    console.log('All images loaded, starting game loop');
                    this.startGameLoop();
                }
            };
            img.onerror = (error) => {
                console.error(`Failed to load image: ${filename}`, error);
                this.imagesLoaded++;
                if (this.imagesLoaded === this.totalImages) {
                    console.log('All image load attempts completed, starting game loop');
                    this.startGameLoop();
                }
            };
            img.src = `src/img/${filename}`;
            this.images[filename.replace('.png', '')] = img;
            console.log(`Attempting to load: ${filename} from ${img.src}`);
        });
    }
    
    startGameLoop() {
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && this.gameState === 'playing') {
                this.performAttack();
                e.preventDefault();
            }
            
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
        
        // Mouse events for attack
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                this.performAttack();
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
        
        // Victory/Game Over
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startNewGame();
        });
    }
    
    startNewGame() {
        this.currentLevel = 1;
        this.totalKills = 0;
        this.gameTime = 0;
        this.startLevel();
    }
    
    startLevel() {
        this.gameState = 'playing';
        this.levelStartTime = Date.now();
        
        // Reset player stats
        this.currentHP = this.maxHP;
        this.killStreak = 0;
        this.enemiesKilled = 0;
        this.weaponBlastReady = false;
        this.attackRange = 4; // Base sword range (increased for better gameplay)
        this.shieldHP = 0;
        
        // Reset collections
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
        this.player = new CatHero(this.worldWidth / 2, this.worldHeight / 2, this.images);
        
        // Clear arrays
        this.enemies = [];
        this.collectibles = [];
        this.environment = [];
        this.particles = [];
        this.weaponEffects = [];
        
        // Create environment
        this.createEnvironment(level.theme);
        
        // Create limited collectibles (max 3 of each)
        this.createCollectibles();
        
        // Reset enemy spawn timer
        this.enemySpawnTimer = Date.now();
        
        // Center camera on player
        this.updateCamera();
    }
    
    createEnvironment(theme) {
        // Add decorative environment elements
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            if (theme === 'garden') {
                this.environment.push(new EnvironmentItem(x, y, 'flower', '🌸'));
            } else if (theme === 'forest') {
                this.environment.push(new EnvironmentItem(x, y, 'flower', '🌲'));
            } else if (theme === 'battlefield') {
                this.environment.push(new EnvironmentItem(x, y, 'rock', '🗿'));
            }
        }
        
        // Add trees and bushes for cover
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            this.environment.push(new EnvironmentItem(x, y, 'tree', '🌳'));
        }
    }
    
    createCollectibles() {
        // Create exactly 3 of each type per level
        const types = [
            { type: 'yarn', emoji: '🧶', count: 3 },
            { type: 'butterfly', emoji: '🦋', count: 3 },
            { type: 'fish', emoji: '🐟', count: 3 }
        ];
        
        types.forEach(({ type, emoji, count }) => {
            for (let i = 0; i < count; i++) {
                const x = Math.random() * (this.worldWidth - 200) + 100;
                const y = Math.random() * (this.worldHeight - 200) + 100;
                this.collectibles.push(new Collectible(x, y, type, emoji));
            }
        });
    }
    
    spawnEnemies() {
        const level = this.levels[this.currentLevel - 1];
        const now = Date.now();
        
        // Check if it's time to spawn enemies
        if (now - this.enemySpawnTimer < this.enemySpawnDelay) return;
        
        // Calculate how many enemies we still need to spawn
        const totalEnemiesNeeded = level.totalBoars + level.totalWolves;
        const currentEnemyCount = this.enemies.length;
        const spawnedCount = this.enemiesKilled + currentEnemyCount;
        
        if (spawnedCount >= totalEnemiesNeeded) return;
        
        // Spawn only 1 enemy at a time for better balance
        const spawnCount = Math.min(1, totalEnemiesNeeded - spawnedCount);
        
        for (let i = 0; i < spawnCount; i++) {
            this.spawnRandomEnemy(level);
        }
        
        // Reset spawn timer with some randomness
        this.enemySpawnTimer = now;
        this.enemySpawnDelay = 3000 + Math.random() * 4000; // 3-7 seconds for balanced spawning
    }
    
    spawnRandomEnemy(level) {
        // Determine enemy type based on level configuration
        const totalBoarsLeft = level.totalBoars - this.enemies.filter(e => e.type === 'boar').length - this.countKilledEnemies('boar');
        const totalWolvesLeft = level.totalWolves - this.enemies.filter(e => e.type === 'wolf').length - this.countKilledEnemies('wolf');
        
        let enemyType = 'boar';
        if (totalWolvesLeft > 0 && totalBoarsLeft > 0) {
            enemyType = Math.random() < 0.8 ? 'boar' : 'wolf'; // 80% boar, 20% wolf
        } else if (totalWolvesLeft > 0) {
            enemyType = 'wolf';
        }
        
        if (totalBoarsLeft <= 0 && totalWolvesLeft <= 0) return;
        
        // Spawn from edges of the screen
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch (edge) {
            case 0: // top
                x = Math.random() * this.worldWidth;
                y = -50;
                break;
            case 1: // right
                x = this.worldWidth + 50;
                y = Math.random() * this.worldHeight;
                break;
            case 2: // bottom
                x = Math.random() * this.worldWidth;
                y = this.worldHeight + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.worldHeight;
                break;
        }
        
        if (enemyType === 'boar') {
            this.enemies.push(new WildBoar(x, y, this.images));
        } else {
            this.enemies.push(new DireWolf(x, y, this.images));
        }
    }
    
    countKilledEnemies(type) {
        // This would normally be tracked, for now we'll estimate
        return 0;
    }
    
    performAttack() {
        if (this.attackCooldown > 0 || this.isAttacking) return;
        
        this.isAttacking = true;
        this.attackCooldown = 500; // 0.5 second cooldown
        this.player.startAttack();
        
        // Check for weapon blast
        if (this.weaponBlastReady) {
            this.performWeaponBlast();
            // Still need to reset isAttacking after weapon blast!
            setTimeout(() => {
                this.isAttacking = false;
            }, 300);
            return;
        }
        
        // Check for enemies in attack range - ALWAYS hit if in range
        let enemiesHit = 0;
        this.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Increased attack range multiplier for easier gameplay
            if (distance <= this.attackRange * 40) { // Increased from 30 to 40 pixels
                enemy.takeDamage(1);
                this.createHitEffect(enemy.x, enemy.y);
                enemiesHit++;
                
                if (enemy.isDead) {
                    this.onEnemyKilled();
                }
            }
        });
        
        // Show attack feedback
        if (enemiesHit > 0) {
            this.showCelebrationMessage(`Hit ${enemiesHit} ${enemiesHit === 1 ? 'enemy' : 'enemies'}! ⚔️`);
        }
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 300);
    }
    
    performWeaponBlast() {
        this.weaponBlastReady = false;
        this.killStreak = 0;
        
        // Create blast effect
        this.weaponEffects.push(new WeaponBlast(this.player.x, this.player.y));
        
        // Kill all enemies within blast radius
        const blastRadius = 200; // Half screen approximately
        this.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= blastRadius) {
                enemy.takeDamage(999); // Instant kill
                this.onEnemyKilled();
            }
        });
        
        this.showCelebrationMessage("SWORD BLAST! 💥");
    }
    
    onEnemyKilled() {
        this.killStreak++;
        this.enemiesKilled++;
        this.totalKills++;
        
        if (this.killStreak >= 10) {
            this.weaponBlastReady = true;
            this.showCelebrationMessage("Weapon Blast Ready! ⚡");
        }
        
        // Check level completion
        this.checkLevelComplete();
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x, y, '💥', 
                Math.random() * 6.28, 
                2 + Math.random() * 3,
                800
            ));
        }
    }
    
    checkLevelComplete() {
        const level = this.levels[this.currentLevel - 1];
        if (this.enemiesKilled >= level.targetKills) {
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
        document.getElementById('victory-yarn').textContent = this.yarnBalls;
        document.getElementById('victory-butterflies').textContent = this.butterflies;
        document.getElementById('victory-fish').textContent = this.fishTreats;
        document.getElementById('victory-time').textContent = this.formatTime(this.gameTime);
        
        // Show modal
        document.getElementById('victory-modal').classList.remove('hidden');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        // Show game over modal (you'll need to add this to HTML)
        this.showCelebrationMessage("Game Over! Try Again 💔");
        setTimeout(() => {
            this.exitToMenu();
        }, 3000);
    }
    
    takeDamage(amount) {
        // Add invulnerability frames
        this.playerInvulnerable = true;
        this.invulnerabilityTimer = 2000; // 2 seconds of invulnerability
        
        if (this.shieldHP > 0) {
            this.shieldHP = Math.max(0, this.shieldHP - amount);
            this.showCelebrationMessage("Shield absorbed damage! 🛡️");
        } else {
            this.currentHP = Math.max(0, this.currentHP - amount);
            this.showCelebrationMessage("Health lost! Find fish treats! 🐟");
            if (this.currentHP <= 0) {
                this.gameOver();
            }
        }
        this.updateUI();
    }
    
    collectItem(collectible) {
        if (collectible.type === 'yarn') {
            this.yarnBalls++;
            this.attackRange += 0.5; // Increase attack range
            this.showCelebrationMessage("Attack Range Increased! ⚔️");
        } else if (collectible.type === 'butterfly') {
            this.butterflies++;
            this.shieldHP += 2; // Add shield
            this.showCelebrationMessage("Shield Activated! 🛡️");
        } else if (collectible.type === 'fish') {
            this.fishTreats++;
            this.currentHP = Math.min(this.maxHP, this.currentHP + 1); // Heal 1 HP
            this.showCelebrationMessage("Health Restored! ❤️");
        }
    }
    
    showCelebrationMessage(message) {
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
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16; // Assuming 60fps
        }
        
        // Update invulnerability timer
        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer -= 16;
            if (this.invulnerabilityTimer <= 0) {
                this.playerInvulnerable = false;
            }
        }
        
        // Update player
        this.player.update(this.keys, this.worldWidth, this.worldHeight);
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
            
            // Check collision with player - only damage if enemy can attack and player is not invulnerable
            if (!enemy.isDead && enemy.canAttackPlayer() && !this.playerInvulnerable) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 35) {
                    this.takeDamage(1);
                    enemy.onPlayerContact(); // Add damage cooldown
                }
            }
        });
        
        // Remove dead enemies after death animation
        this.enemies = this.enemies.filter(enemy => !enemy.shouldRemove);
        
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
        
        // Update particles and effects
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        this.weaponEffects.forEach(effect => effect.update());
        this.weaponEffects = this.weaponEffects.filter(effect => effect.life > 0);
        
        // Update camera
        this.updateCamera();
        
        // Update UI
        this.updateUI();
    }
    
    createCollectionEffect(x, y, type) {
        // Create celebration effect when collecting items
        const emoji = type === 'yarn' ? '⚔️' : type === 'butterfly' ? '🛡️' : '❤️';
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x, y, emoji, 
                Math.random() * 6.28, 
                2 + Math.random() * 3,
                1000
            ));
        }
    }
    
    updateUI() {
        // Update HP hearts
        const heartsContainer = document.querySelector('.hearts-display') || this.createHeartsDisplay();
        heartsContainer.innerHTML = '';
        
        // Add HP hearts
        for (let i = 0; i < this.maxHP; i++) {
            const heart = document.createElement('span');
            heart.style.fontSize = '24px';
            heart.textContent = i < this.currentHP ? '❤️' : '🤍';
            heartsContainer.appendChild(heart);
        }
        
        // Add shield hearts
        for (let i = 0; i < this.shieldHP; i++) {
            const shield = document.createElement('span');
            shield.style.fontSize = '24px';
            shield.textContent = '🛡️';
            heartsContainer.appendChild(shield);
        }
        
        // Update collections
        document.getElementById('yarn-display').textContent = this.yarnBalls;
        document.getElementById('butterfly-display').textContent = this.butterflies;
        document.getElementById('fish-display').textContent = this.fishTreats;
        document.getElementById('time-display').textContent = this.formatTime(this.gameTime);
        
        // Update progress bar
        if (this.currentLevel <= this.levels.length) {
            const level = this.levels[this.currentLevel - 1];
            const progress = Math.min(100, (this.enemiesKilled / level.targetKills) * 100);
            
            document.getElementById('progress-bar').style.width = progress + '%';
            document.getElementById('progress-text').textContent = 
                `${this.enemiesKilled}/${level.targetKills} enemies defeated - ${level.name}`;
        }
        
        // Update weapon blast indicator
        const progressText = document.getElementById('progress-text');
        if (this.weaponBlastReady) {
            progressText.innerHTML += ' | <span style="color: gold; font-weight: bold;">⚡ SWORD BLAST READY! ⚡</span>';
        } else if (this.killStreak > 0) {
            progressText.innerHTML += ` | Kill Streak: ${this.killStreak}/10`;
        }
    }
    
    createHeartsDisplay() {
        const container = document.querySelector('.hearts-display');
        return container;
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
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render weapon effects
        this.weaponEffects.forEach(effect => effect.render(this.ctx));
        
        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Render player with invulnerability effect
        if (this.player) {
            if (this.playerInvulnerable && Math.floor(Date.now() / 200) % 2) {
                // Flash effect during invulnerability
                this.ctx.save();
                this.ctx.globalAlpha = 0.5;
                this.player.render(this.ctx);
                this.ctx.restore();
            } else {
                this.player.render(this.ctx);
            }
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    gameLoop() {
        if (this.imagesLoaded >= this.totalImages) {
            this.update();
            this.render();
        } else {
            // Show loading screen
            this.ctx.fillStyle = '#7CB342';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Loading... ${this.imagesLoaded}/${this.totalImages}`, this.canvas.width/2, this.canvas.height/2);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Cat Hero player class
class CatHero {
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
            
            // Scale image to match emoji size (much smaller)
            const targetSize = 30; // Same as emoji size
            const scale = targetSize / Math.max(image.width, image.height);
            ctx.scale(scale, scale);
            
            // Draw image centered
            ctx.drawImage(image, -image.width/2, -image.height/2);
            
            ctx.restore();
        } else {
            // Fallback to emoji if image not loaded
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐱', 0, 10);
            ctx.restore();
        }
    }
}

// Wild Boar enemy class
class WildBoar {
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
            
            // Scale image to match emoji size
            const targetSize = 25; // Slightly smaller than cat
            const scale = targetSize / Math.max(image.width, image.height);
            ctx.scale(scale, scale);
            
            // Fade out when dying
            if (this.isDead) {
                ctx.globalAlpha = 1 - (this.deathTimer / 1000);
            }
            
            ctx.drawImage(image, -image.width/2, -image.height/2);
            
            ctx.restore();
        } else {
            // Fallback
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.font = '25px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐗', 0, 8);
            ctx.restore();
        }
    }
}

// Dire Wolf enemy class
class DireWolf {
    constructor(x, y, images) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 2; // Reduced from 3 to 2 for better gameplay
        this.size = 40;
        this.images = images;
        this.type = 'wolf';
        this.maxHP = 2;
        this.currentHP = 2;
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
            if (this.deathTimer >= 1000) {
                this.shouldRemove = true;
            }
            return;
        }
        
        // Chase player (wolves are faster and smarter)
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
        this.currentAction = Math.floor(this.animationTime * 4) % 2 === 0 ? 'act_1' : 'act_2';
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
        this.contactCooldown = 1500; // 1.5 second cooldown - wolves are more aggressive than boars
    }
    
    render(ctx) {
        const imageName = `wolf_${this.currentAction}`;
        const image = this.images[imageName];
        
        if (image) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Scale image to match emoji size
            const targetSize = 30; // Same size as cat since wolves are bigger
            const scale = targetSize / Math.max(image.width, image.height);
            ctx.scale(scale, scale);
            
            if (this.isDead) {
                ctx.globalAlpha = 1 - (this.deathTimer / 1000);
            }
            
            ctx.drawImage(image, -image.width/2, -image.height/2);
            
            ctx.restore();
        } else {
            // Fallback
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐺', 0, 10);
            ctx.restore();
        }
    }
}

// Collectible items (same as before but with new power-up effects)
class Collectible {
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

// Environment decorations (same as before)
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

// Particle effects (same as before)
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

// Weapon Blast effect
class WeaponBlast {
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

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new HeroAdventureGame();
});