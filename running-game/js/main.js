// Main entry point for Cat Hero's Adventure
import { GameEngine } from './core/GameEngine.js';

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting Cat Hero\'s Adventure with modular architecture');
    window.game = new GameEngine();
});