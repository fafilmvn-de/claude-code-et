// Cat Hero's Backyard Adventure - Main Game Engine
import { CatHero } from '../entities/CatHero.js';
import { WildBoar } from '../entities/WildBoar.js';
import { DireWolf } from '../entities/DireWolf.js';
import { Raccoon } from '../entities/Raccoon.js';
import { Fox } from '../entities/Fox.js';
import { GiantBug } from '../entities/GiantBug.js';
import { AngryBear } from '../entities/AngryBear.js';
import { EnvironmentItem } from '../entities/EnvironmentItem.js';
import { Particle } from '../effects/Particle.js';
import { WeaponBlast } from '../effects/WeaponBlast.js';
import { ImageLoader } from '../utils/ImageLoader.js';
import { SpriteProcessor } from '../utils/SpriteProcessor.js';
import { SoundManager } from '../utils/SoundManager.js';
import { WaveManager } from './WaveManager.js';
import { ComboSystem } from './ComboSystem.js';
import { ShopManager } from './ShopManager.js';
import { LeaderboardManager } from './LeaderboardManager.js';

export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Enable image smoothing for better sprite rendering
        this.ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete, victory
        // Player stats
        this.maxHP = 6; // 6 HP per spec
        this.currentHP = 6;
        this.attackRange = 4; // Increased from 2 to make game easier

        // Game objects
        this.player = null;
        this.enemies = [];
        this.environment = [];
        this.particles = [];
        this.weaponEffects = [];

        // World settings
        this.worldWidth = 1600;
        this.worldHeight = 1200;
        this.camera = { x: 0, y: 0 };

        // Invulnerability
        this.playerInvulnerable = false;
        this.invulnerabilityTimer = 0;

        // Wave state
        this.coins = 0;
        this.totalKills = 0;
        this.usedFreeRevive = false;
        this.bossBear = null;

        this.waveManager = new WaveManager({
            onWaveCleared: (waveNum) => this.#onWaveCleared(waveNum),
            onSpawnEnemy: (type, count) => this.#spawnEnemiesOfType(type, count),
            onBossWaveStart: (waveNum) => this.#onBossWaveStart(waveNum)
        });
        this.comboSystem = new ComboSystem({
            onChanged: (count, mult, tier, fraction) => this.#updateComboHUD(count, mult, tier, fraction),
            onBreak: () => {
                this.#updateComboHUD(0, 1, 'grey', 0);
                this.sound.playComboBreak();
            },
            onMilestone: (mult, tier) => { this.sound.playComboMilestone(); }
        });
        this.maxCombo = 0; // track for leaderboard
        this.shopManager = new ShopManager({
            onPurchase: (upgrade) => this.#applyUpgrade(upgrade)
        });
        this.leaderboard = new LeaderboardManager();
        this.screenShake = 0;
        this.floatingTexts = [];
        // Expose purchase handler for shop HTML onclick
        window.__shopPurchase = (id) => {
            const bought = this.shopManager.purchase(id);
            if (bought) this.shopManager.renderShop();
        };

        // Image loading and processing
        this.images = {};
        this.imageLoader = new ImageLoader();
        this.spriteProcessor = new SpriteProcessor();

        // Sound manager
        this.sound = new SoundManager();

        // Input handling
        this.keys = {};
        this.isAttacking = false;
        this.attackCooldown = 0;

        // Mobile touch state
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchDir = { x: 0, y: 0 };
        this.isTouching = false;
        this.touchOriginX = 0;
        this.touchOriginY = 0;

        this.loadImages();
        this.setupEventListeners();
        this.setupUI();
        this.#setupResponsiveCanvas();
    }
    
    #shake(intensity) {
        this.screenShake = Math.max(this.screenShake, intensity);
    }

    #spawnCoinPopText(x, y, amount) {
        const tierColors = { 1: '#94a3b8', 2: '#60a5fa', 3: '#f97316', 4: '#a855f7' };
        this.floatingTexts.push({
            x, y,
            text: `+${amount}\u{1FA99}`,
            color: tierColors[amount] || '#ffffff',
            life: 1.0,
            vy: -1.5
        });
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
        
        // Canvas touch — hold/drag for movement, two-finger for blast
        const canvas = this.canvas;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState !== 'playing') return;
            if (e.touches.length >= 2 && this.comboSystem.isBlastReady()) {
                this.performWeaponBlast();
                return;
            }
            const t = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.touchOriginX = (t.clientX - rect.left) * scaleX;
            this.touchOriginY = (t.clientY - rect.top) * scaleY;
            this.isTouching = true;
            this.touchDir = { x: 0, y: 0 };
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isTouching || this.gameState !== 'playing') return;
            const t = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const cx = (t.clientX - rect.left) * scaleX;
            const cy = (t.clientY - rect.top) * scaleY;
            const dx = cx - this.touchOriginX;
            const dy = cy - this.touchOriginY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 12) { // 12px dead zone
                this.touchDir = { x: dx / len, y: dy / len };
            } else {
                this.touchDir = { x: 0, y: 0 };
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.touches.length === 0) {
                this.isTouching = false;
                this.touchDir = { x: 0, y: 0 };
            }
        }, { passive: false });
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
        
        // Leaderboard button on main menu
        const lbBtn = document.getElementById('leaderboard-btn');
        if (lbBtn) lbBtn.addEventListener('click', () => {
            this.leaderboard.renderLeaderboard(0);
            const modal = document.getElementById('leaderboard-modal');
            if (modal) modal.classList.remove('hidden');
        });

        // Close leaderboard (back to menu)
        const lbMenuBtn = document.getElementById('lb-menu-btn');
        if (lbMenuBtn) lbMenuBtn.addEventListener('click', () => {
            const modal = document.getElementById('leaderboard-modal');
            if (modal) modal.classList.add('hidden');
        });

        // Play again from leaderboard
        const lbPlayBtn = document.getElementById('lb-play-again-btn');
        if (lbPlayBtn) lbPlayBtn.addEventListener('click', () => {
            const modal = document.getElementById('leaderboard-modal');
            if (modal) modal.classList.add('hidden');
            this.startNewGame();
        });

        // Save score button
        const saveBtn = document.getElementById('save-score-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const name = document.getElementById('player-name-input')?.value || 'Anonymous';
            this.leaderboard.saveScore({
                name,
                score: this._finalScore,
                wavesSurvived: this.waveManager.getCurrentWave(),
                maxCombo: this.maxCombo
            });
            const nameModal = document.getElementById('name-entry-modal');
            if (nameModal) nameModal.classList.add('hidden');
            this.leaderboard.renderLeaderboard(this._finalScore);
            const lbModal = document.getElementById('leaderboard-modal');
            if (lbModal) lbModal.classList.remove('hidden');
        });

        // Skip save button
        const skipBtn = document.getElementById('skip-save-btn');
        if (skipBtn) skipBtn.addEventListener('click', () => {
            const nameModal = document.getElementById('name-entry-modal');
            if (nameModal) nameModal.classList.add('hidden');
            this.leaderboard.renderLeaderboard(0);
            const lbModal = document.getElementById('leaderboard-modal');
            if (lbModal) lbModal.classList.remove('hidden');
        });
    }
    
    startNewGame() {
        this.totalKills = 0;
        this.coins = 0;
        this.currentHP = 6; // 6 HP per spec
        this.maxHP = 6;
        this.usedFreeRevive = false;
        this.bossBear = null;
        this.waveManager = new WaveManager({
            onWaveCleared: (waveNum) => this.#onWaveCleared(waveNum),
            onSpawnEnemy: (type, count) => this.#spawnEnemiesOfType(type, count),
            onBossWaveStart: (waveNum) => this.#onBossWaveStart(waveNum)
        });
        this.comboSystem = new ComboSystem({
            onChanged: (count, mult, tier, fraction) => this.#updateComboHUD(count, mult, tier, fraction),
            onBreak: () => { this.#updateComboHUD(0, 1, 'grey', 0); this.sound.playComboBreak(); },
            onMilestone: (mult, tier) => { this.sound.playComboMilestone(); }
        });
        this.maxCombo = 0;
        this.shopManager = new ShopManager({
            onPurchase: (upgrade) => this.#applyUpgrade(upgrade)
        });
        this.coins = 0;
        this.gameState = 'playing';
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.add('hidden');
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.classList.remove('hidden');
        this.initializeWorld();
        // Start first wave after a short delay
        setTimeout(() => this.#startNextWave(), 1000);
    }

    initializeWorld() {
        this.player = new CatHero(this.worldWidth / 2, this.worldHeight / 2, this.images);
        this.enemies = [];
        this.environment = [];
        this.particles = [];
        this.weaponEffects = [];
        this.bossBear = null;
        this.createEnvironment();
        this.updateCamera();
    }
    
    createEnvironment() {
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            this.environment.push(new EnvironmentItem(x, y, 'flower', '🌸'));
        }
        
        // Add trees and bushes for cover
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            this.environment.push(new EnvironmentItem(x, y, 'tree', '🌳'));
        }
    }
    
    performAttack() {
        if (this.attackCooldown > 0 || this.isAttacking) return;
        
        this.isAttacking = true;
        this.attackCooldown = 500; // 0.5 second cooldown
        this.player.startAttack();
        
        // Check for weapon blast (AOE attack)
        if (this.comboSystem.isBlastReady()) {
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
            if (closestEnemy instanceof AngryBear) this.#shake(3);
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
        this.totalKills++;
        this.waveManager.enemyKilled();
        this.comboSystem.hit();
        this.maxCombo = Math.max(this.maxCombo, this.comboSystem.getCount());
        const coinDrop = this.comboSystem.getMultiplier(); // ×1 to ×4
        this.shopManager.addCoins(coinDrop);
        const deadEnemy = this.enemies.find(e => e.isDead && !e.shouldRemove);
        if (deadEnemy) this.#spawnCoinPopText(deadEnemy.x, deadEnemy.y - 20, coinDrop);
        this.coins = this.shopManager.getCoins();
        this.sound.playHit(this.comboSystem.getTier());
        this.sound.playCoinCollect();
        this.updateHUD();
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
    
    gameOver() {
        // Free revive safety net for younger players (waves 1–5, once per run)
        if (this.waveManager && this.waveManager.getCurrentWave() <= 5 && !this.usedFreeRevive) {
            this.usedFreeRevive = true;
            this.currentHP = 3;
            this.playerInvulnerable = true;
            this.invulnerabilityTimer = 3000;
            const celebMsg = document.getElementById('celebration-message');
            if (celebMsg) {
                celebMsg.textContent = 'Second chance! 🐱💪';
                celebMsg.classList.remove('hidden');
                setTimeout(() => celebMsg.classList.add('hidden'), 2000);
            }
            return;
        }

        this.gameState = 'gameOver';
        if (this.comboSystem) this.comboSystem.reset();

        const score = this.leaderboard.calculateScore({
            wavesSurvived: this.waveManager.getCurrentWave(),
            totalKills: this.totalKills,
            coinsSpent: this.shopManager.getCoinsSpent(),
            maxCombo: this.maxCombo
        });
        this._finalScore = score;

        const deathWave = document.getElementById('death-wave');
        if (deathWave) deathWave.textContent = this.waveManager.getCurrentWave();
        const deathScore = document.getElementById('death-score');
        if (deathScore) deathScore.textContent = score.toLocaleString();
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) nameInput.value = this.leaderboard.getLastName();
        const nameModal = document.getElementById('name-entry-modal');
        if (nameModal) nameModal.classList.remove('hidden');
    }
    
    takeDamage(amount) {
        this.#shake(8);
        // Add invulnerability frames
        this.playerInvulnerable = true;
        this.invulnerabilityTimer = 2000; // 2 seconds of invulnerability

        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) {
            this.gameOver();
        }
        this.sound.playPlayerHit();
        this.updateHUD();
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

        if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 0.5);

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
        
        // Update combo system
        this.comboSystem.update(16); // ~16ms per frame at 60fps

        // Merge touch direction into keys for mobile movement
        if (this.isMobile && this.isTouching) {
            this.keys['ArrowLeft']  = this.touchDir.x < -0.3;
            this.keys['ArrowRight'] = this.touchDir.x > 0.3;
            this.keys['ArrowUp']    = this.touchDir.y < -0.3;
            this.keys['ArrowDown']  = this.touchDir.y > 0.3;
        }

        // Update player
        this.player.update(this.keys, this.worldWidth, this.worldHeight);

        // Mobile auto-attack: fires when in range, no button needed
        if (this.isMobile && this.isTouching && this.attackCooldown <= 0 && !this.isAttacking) {
            this.performAttack();
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player);

            // Check collision with player - only damage if enemy can attack and player is not invulnerable
            if (!enemy.isDead && enemy.canAttackPlayer && enemy.canAttackPlayer() && !this.playerInvulnerable) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                if (Math.sqrt(dx*dx + dy*dy) < 35) {
                    const dmg = enemy.damage ?? 1;
                    this.takeDamage(dmg);
                    enemy.onPlayerContact();
                }
            }

            // Raccoon coin steal
            if (enemy instanceof Raccoon && !enemy.isDead) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                if (Math.sqrt(dx*dx + dy*dy) < 40 && enemy.trySteaCoins()) {
                    this.coins = Math.max(0, this.coins - 2);
                    this.updateHUD();
                }
            }
        });
        
        // Remove dead enemies after death animation
        this.enemies = this.enemies.filter(enemy => !enemy.shouldRemove);

        // Update boss HP bar
        if (this.bossBear && !this.bossBear.isDead) {
            const pct = (this.bossBear.hp / this.bossBear.maxHp) * 100;
            const fill = document.getElementById('boss-bar-fill');
            if (fill) fill.style.width = pct + '%';
            const hpText = document.getElementById('boss-hp-text');
            if (hpText) hpText.textContent = `${this.bossBear.hp} / ${this.bossBear.maxHp}`;
        } else if (this.bossBear && this.bossBear.isDead) {
            this.sound.playBossDeath();
            this.#shake(18);
            const wrapper = document.getElementById('boss-bar-wrapper');
            if (wrapper) wrapper.classList.add('hidden');
            this.bossBear = null;
        }
        
        // Update particles and effects
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        this.weaponEffects.forEach(effect => effect.update());
        this.weaponEffects = this.weaponEffects.filter(effect => effect.life > 0);

        this.floatingTexts.forEach(t => { t.y += t.vy; t.life -= 0.02; });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

        // Update camera
        this.updateCamera();

        this.updateHUD();
    }
    
    updateHUD() {
        // HP hearts
        const el = document.getElementById('hp-hearts');
        if (el) {
            el.innerHTML = Array.from({ length: this.maxHP }, (_, i) =>
                `<span>${i < this.currentHP ? '❤️' : '🤍'}</span>`
            ).join('');
        }
        // Coin display
        const coinEl = document.getElementById('coin-display');
        if (coinEl) coinEl.textContent = this.coins;
        // Wave progress — use current wave's total, not cumulative kills
        const remaining = this.waveManager ? this.waveManager.getRemainingCount() : 0;
        const waveTotal = this.waveManager ? this.waveManager.getWaveTotal() : 0;
        const pct = waveTotal > 0 ? Math.min(100, ((waveTotal - remaining) / waveTotal) * 100) : 0;
        const bar = document.getElementById('wave-progress-bar');
        if (bar) bar.style.width = pct + '%';

        const score = this.leaderboard.calculateScore({
            wavesSurvived: this.waveManager.getCurrentWave(),
            totalKills: this.totalKills,
            coinsSpent: this.shopManager.getCoinsSpent(),
            maxCombo: this.maxCombo
        });
        const scoreEl = document.getElementById('score-value');
        if (scoreEl) scoreEl.textContent = score.toLocaleString();
        const pb = this.leaderboard.getPersonalBest();
        const bestEl = document.getElementById('score-best');
        if (bestEl && pb) bestEl.textContent = `BEST ${pb.score.toLocaleString()}`;
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
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.classList.add('hidden');
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal) pauseModal.classList.add('hidden');
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.remove('hidden');
    }
    
    render() {
        const shakeX = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
        const shakeY = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;

        this.ctx.fillStyle = '#7CB342';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);
        
        // Render environment
        this.environment.forEach(item => item.render(this.ctx));
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render weapon effects
        this.weaponEffects.forEach(effect => effect.render(this.ctx));
        
        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));

        // Render floating coin pop texts
        this.floatingTexts.forEach(t => {
            this.ctx.save();
            this.ctx.globalAlpha = t.life;
            this.ctx.fillStyle = t.color;
            this.ctx.font = 'bold 18px Nunito, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t.text, t.x, t.y);
            this.ctx.restore();
        });

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
    
    #onWaveCleared(waveNum) {
        this.sound.playWaveClear();
        this.#showWaveBanner(`Wave ${waveNum} — Survived! 🎉`);
        setTimeout(() => {
            if (this.waveManager.shouldOpenShop(waveNum)) {
                this.#openShop();
            } else {
                this.#startNextWave();
            }
        }, 2000);
    }

    #openShop() {
        this.gameState = 'shop';
        this.sound.playShopOpen();
        this.shopManager.renderShop();
        const overlay = document.getElementById('shop-overlay');
        if (overlay) overlay.classList.remove('hidden');
        const closeBtn = document.getElementById('shop-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                if (overlay) overlay.classList.add('hidden');
                this.gameState = 'playing';
                this.#startNextWave();
            };
        }
    }

    #applyUpgrade(upgrade) {
        switch (upgrade.effect) {
            case 'attackCooldown':
                this.attackCooldownBase = Math.floor((this.attackCooldownBase ?? 500) * upgrade.value);
                break;
            case 'attackRange':
                this.attackRange = (this.attackRange ?? 50) * upgrade.value;
                break;
            case 'restoreHp':
                this.currentHP = Math.min(this.maxHP, this.currentHP + upgrade.value);
                break;
            case 'maxHp':
                this.maxHP += upgrade.value;
                this.currentHP += upgrade.value;
                break;
            case 'speed':
                if (this.player) this.player.speed = (this.player.speed ?? 3) * upgrade.value;
                break;
            case 'comboWindow':
                if (this.comboSystem) this.comboSystem.extendWindow(upgrade.value);
                break;
            case 'invulnerability':
                this.invulnerabilityDuration = (this.invulnerabilityDuration ?? 2500) + upgrade.value;
                break;
        }
        this.updateHUD();
    }

    #startNextWave() {
        if (this.gameState !== 'playing') return;
        this.waveManager.startWave();
        const w = this.waveManager.getCurrentWave();
        const waveLabelEl = document.getElementById('wave-label');
        if (waveLabelEl) waveLabelEl.textContent = `WAVE ${w}`;
    }

    #onBossWaveStart(waveNum) {
        const bossBar = document.getElementById('boss-bar-wrapper');
        if (bossBar) bossBar.classList.remove('hidden');
        this.sound.playBossSpawn();
        this.bossBear = null; // will be set in #spawnEnemiesOfType
    }

    #spawnEnemiesOfType(type, count) {
        for (let i = 0; i < count; i++) {
            const { x, y } = this.#randomEdgePosition();
            let enemy;
            switch (type) {
                case 'boar':    enemy = new WildBoar(x, y, this.images); break;
                case 'wolf':    enemy = new DireWolf(x, y, this.images); break;
                case 'raccoon': enemy = new Raccoon(x, y); break;
                case 'fox':     enemy = new Fox(x, y); break;
                case 'bug':
                    enemy = new GiantBug(x, y);
                    break;
                case 'bear': {
                    const bear = new AngryBear(x, y);
                    bear.onScreenEdgeFlash = (color) => this.#flashScreenEdge(color);
                    this.bossBear = bear;
                    this.enemies.push(bear);
                    continue;
                }
                default: enemy = new WildBoar(x, y, this.images);
            }
            this.enemies.push(enemy);
        }
    }

    #randomEdgePosition() {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch (edge) {
            case 0: x = Math.random() * this.worldWidth; y = -50; break;
            case 1: x = this.worldWidth + 50; y = Math.random() * this.worldHeight; break;
            case 2: x = Math.random() * this.worldWidth; y = this.worldHeight + 50; break;
            default: x = -50; y = Math.random() * this.worldHeight;
        }
        return { x, y };
    }

    #showWaveBanner(text) {
        const el = document.getElementById('wave-banner');
        if (!el) return;
        el.textContent = text;
        el.classList.add('visible');
        setTimeout(() => el.classList.remove('visible'), 2000);
    }

    #updateComboHUD(count, mult, tier, fraction) {
        const overlay = document.getElementById('combo-overlay');
        if (!overlay) return;
        const tierColors = { grey: '#94a3b8', blue: '#60a5fa', orange: '#f97316', purple: '#a855f7' };
        const tierEmojis = { grey: '', blue: '💙', orange: '🔥', purple: '⚡' };

        if (count === 0) {
            overlay.classList.add('hidden');
            return;
        }
        overlay.classList.remove('hidden');
        overlay.style.borderColor = tierColors[tier];
        const countEl = document.getElementById('combo-count');
        if (countEl) countEl.textContent = count;
        const multEl = document.getElementById('combo-mult');
        if (multEl) {
            multEl.textContent = `×${mult} ${tierEmojis[tier]}`;
            multEl.style.color = tierColors[tier];
        }
        const barEl = document.getElementById('combo-bar');
        if (barEl) {
            barEl.style.width = (fraction * 100) + '%';
            barEl.style.background = tierColors[tier];
        }
    }

    #flashScreenEdge(color) {
        const wrapper = document.getElementById('canvas-wrapper');
        if (!wrapper) return;
        if (!color) {
            wrapper.style.boxShadow = '';
            return;
        }
        wrapper.style.boxShadow = `0 0 0 8px ${color}`;
        setTimeout(() => {
            const el = document.getElementById('canvas-wrapper');
            if (el) el.style.boxShadow = '';
        }, 600);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    #setupResponsiveCanvas() {
        const resize = () => {
            const aspectRatio = 4 / 3;
            const maxW = window.innerWidth;
            const maxH = window.innerHeight;
            let w = maxW;
            let h = w / aspectRatio;
            if (h > maxH * 0.85) {
                h = maxH * 0.85;
                w = h * aspectRatio;
            }
            this.canvas.style.width = Math.floor(w) + 'px';
            this.canvas.style.height = Math.floor(h) + 'px';
        };
        window.addEventListener('resize', resize);
        resize();
    }
}