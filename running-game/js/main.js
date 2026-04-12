// Main entry point for Cat Hero's Adventure
import { GameEngine } from './core/GameEngine.js';
import { WaveManager } from './core/WaveManager.js';
import { ComboSystem } from './core/ComboSystem.js';
import { ShopManager } from './core/ShopManager.js';
import { LeaderboardManager } from './core/LeaderboardManager.js';

// Expose for Playwright tests
window.__WaveManager = WaveManager;
window.__ComboSystem = ComboSystem;
window.__ShopManager = ShopManager;
window.__LeaderboardManager = LeaderboardManager;

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting Cat Hero\'s Adventure with modular architecture');
    window.game = new GameEngine();
});