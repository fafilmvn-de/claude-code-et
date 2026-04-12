// Main entry point for Cat Hero's Adventure
import { GameEngine } from './core/GameEngine.js';
import { WaveManager } from './core/WaveManager.js';
import { ComboSystem } from './core/ComboSystem.js';

// Expose for Playwright tests
window.__WaveManager = WaveManager;
window.__ComboSystem = ComboSystem;

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting Cat Hero\'s Adventure with modular architecture');
    window.game = new GameEngine();
});