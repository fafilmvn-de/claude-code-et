// Cat Hero's Backyard Adventure - Main Game Engine
import { CatHero } from '../entities/CatHero.js';
import { WildBoar } from '../entities/WildBoar.js';
import { DireWolf } from '../entities/DireWolf.js';
import { Collectible } from '../entities/Collectible.js';
import { EnvironmentItem } from '../entities/EnvironmentItem.js';
import { Particle } from '../effects/Particle.js';
import { WeaponBlast } from '../effects/WeaponBlast.js';
import { ImageLoader } from '../utils/ImageLoader.js';
import { SpriteProcessor } from '../utils/SpriteProcessor.js';

export class GameEngine {
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
        
        // Enemy spawn system - MUCH FASTER spawn speed
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 1000; // Fast initial spawn (1 second)
        this.enemiesKilled = 0;
        this.playerInvulnerable = false;
        this.invulnerabilityTimer = 0;
        
        // Level configurations - INCREASED enemies by 1.5x
        this.levels = [
            {
                name: "Boar Invasion",
                bgColor: "#7CB342",
                totalBoars: 30, // Increased from 20 to 30 (1.5x)
                totalWolves: 0,
                targetKills: 30, // Increased from 20 to 30 (1.5x)
                theme: "garden",
                description: "Defend the garden from wild boars!"
            },
            {
                name: "Wolf Pack Attack",
                bgColor: "#66BB6A", 
                totalBoars: 45, // Increased from 30 to 45 (1.5x)
                totalWolves: 8, // Increased from 5 to 8 (1.5x, rounded up)
                targetKills: 53, // Increased from 35 to 53 (1.5x, rounded up)
                theme: "forest",
                description: "Face the fierce wolf pack!"
            },
            {
                name: "Final Battle",
                bgColor: "#42A5F5",
                totalBoars: 60, // Increased from 40 to 60 (1.5x)
                totalWolves: 15, // Increased from 10 to 15 (1.5x)
                targetKills: 75, // Increased from 50 to 75 (1.5x)
                theme: "battlefield",
                description: "The ultimate showdown!"
            }
        ];
        
        // Image loading and processing
        this.images = {};
        this.imageLoader = new ImageLoader();
        this.spriteProcessor = new SpriteProcessor();
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isAttacking = false;
        this.attackCooldown = 0;
        
        this.loadImages();
        this.setupEventListeners();
        this.setupUI();
    }
    
    async loadImages() {
        const imageFiles = [
            'avt_act_1.png', 'avt_act_2.png', 'avt_act_3.png', 'avt_die_1.png',
            'boar_act_1.png', 'boar_act_2.png', 'boar_die_1.png',
            'wolf_act_1.png', 'wolf_act_2.png', 'wolf_die_1.png'
        ];
        
        try {
            const rawImages = await this.imageLoader.loadImages(imageFiles, 'src/img/');
            
            // Process images to remove grey checkerboard backgrounds
            this.images = {};
            const processPromises = [];
            
            for (const [key, image] of Object.entries(rawImages)) {
                if (image) {
                    // Process each image to remove grey backgrounds
                    processPromises.push(
                        this.spriteProcessor.processImage(image, key).then(processedImage => {
                            this.images[key] = processedImage;
                        })
                    );
                } else {
                    this.images[key] = null;
                }
            }
            
            // Wait for all image processing to complete
            await Promise.all(processPromises);
            
            console.log('All images loaded and processed, starting game loop');
            this.startGameLoop();
        } catch (error) {
            console.warn('Some images failed to load or process, starting anyway', error);
            this.startGameLoop();
        }
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
        
        // Spawn 1-3 enemies randomly for more dynamic gameplay
        const randomSpawnCount = 1 + Math.floor(Math.random() * 3); // 1-3 enemies
        const spawnCount = Math.min(randomSpawnCount, totalEnemiesNeeded - spawnedCount);
        
        for (let i = 0; i < spawnCount; i++) {
            this.spawnRandomEnemy(level);
        }
        
        // Reset spawn timer with faster intervals
        this.enemySpawnTimer = now;
        this.enemySpawnDelay = 800 + Math.random() * 1200; // Much faster: 800-2000ms (0.8-2 seconds)
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
        
        // Check for weapon blast (AOE attack)
        if (this.weaponBlastReady) {
            this.performWeaponBlast();
            setTimeout(() => {
                this.isAttacking = false;
            }, 300);
            return;
        }
        
        // SINGLE TARGET ATTACK - Find closest enemy and attack ONLY that one
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        // Find the closest living enemy within attack range
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.isDead) continue;
            
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if enemy is in attack range
            if (distance <= this.attackRange * 40) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        }
        
        // Attack ONLY the single closest enemy
        if (closestEnemy && !closestEnemy.isDead) {
            closestEnemy.takeDamage(1);
            this.createHitEffect(closestEnemy.x, closestEnemy.y);
            
            if (closestEnemy.isDead) {
                this.onEnemyKilled();
            }
            
            this.showCelebrationMessage("Hit enemy! ⚔️");
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
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}