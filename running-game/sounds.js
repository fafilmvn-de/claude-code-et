// Simple Sound System using Web Audio API
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        
        this.initAudioContext();
        this.createSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    // Generate simple tones and effects using oscillators
    createSounds() {
        if (!this.enabled || !this.audioContext) return;
        
        this.sounds = {
            jump: () => this.createTone(800, 0.1, 'sine'),
            coin: () => this.createTone(1200, 0.2, 'square'),
            gameOver: () => this.createGameOverSound(),
            levelComplete: () => this.createLevelCompleteSound(),
            victory: () => this.createVictorySound()
        };
    }
    
    createTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createGameOverSound() {
        if (!this.enabled) return;
        
        // Descending tone for game over
        setTimeout(() => this.createTone(400, 0.3, 'sawtooth'), 0);
        setTimeout(() => this.createTone(300, 0.3, 'sawtooth'), 150);
        setTimeout(() => this.createTone(200, 0.5, 'sawtooth'), 300);
    }
    
    createLevelCompleteSound() {
        if (!this.enabled) return;
        
        // Ascending victory melody
        setTimeout(() => this.createTone(523, 0.2, 'sine'), 0);    // C
        setTimeout(() => this.createTone(659, 0.2, 'sine'), 200);  // E
        setTimeout(() => this.createTone(784, 0.2, 'sine'), 400);  // G
        setTimeout(() => this.createTone(1047, 0.4, 'sine'), 600); // High C
    }
    
    createVictorySound() {
        if (!this.enabled) return;
        
        // Full victory fanfare
        setTimeout(() => this.createTone(523, 0.3, 'sine'), 0);
        setTimeout(() => this.createTone(659, 0.3, 'sine'), 300);
        setTimeout(() => this.createTone(784, 0.3, 'sine'), 600);
        setTimeout(() => this.createTone(1047, 0.5, 'sine'), 900);
        setTimeout(() => this.createTone(1319, 0.8, 'sine'), 1400);
    }
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.sounds[soundName]();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Create global sound system instance
window.soundSystem = new SoundSystem();