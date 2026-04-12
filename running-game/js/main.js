// Main entry point for Cat Hero's Adventure
import { GameEngine } from './core/GameEngine.js';
import { WaveManager } from './core/WaveManager.js';

// Expose for Playwright tests
window.__WaveManager = WaveManager;

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting Cat Hero\'s Adventure with modular architecture');
    window.game = new GameEngine();
});