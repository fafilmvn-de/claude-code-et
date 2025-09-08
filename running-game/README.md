# Cat Runner - Adventure Game 🐱

A fun and addictive endless runner game featuring a cute cat character! Navigate through 3 exciting levels, collect coins, and avoid obstacles in this modern web-based game.

![Cat Runner Game](https://via.placeholder.com/800x400/87CEEB/000000?text=Cat+Runner+Game)

## ✨ Features

### Core Gameplay
- **Endless Running Action**: Your cat never stops running - master the art of timing!
- **Three Unique Levels**: 
  - 🌲 **Forest Path** - Navigate through the green wilderness
  - 🌵 **Desert Canyon** - Survive the harsh desert terrain  
  - ❄️ **Ice Mountain** - Brave the frozen peaks
- **Simple Controls**: Just 3 keys to master - Left, Right, and Jump!
- **Coin Collection**: Gather golden coins to boost your score
- **Obstacle Avoidance**: Jump over and dodge various themed obstacles

### Game Features
- **Save/Load System**: Continue your adventure where you left off
- **Progressive Difficulty**: Each level increases the challenge
- **Time Trials**: Complete each 2-minute level as fast as possible
- **Responsive Design**: Play on desktop, tablet, or mobile
- **Sound Effects**: Immersive audio feedback for all actions
- **Pause Functionality**: ESC to pause anytime during gameplay

### Technical Features
- **Modern Web Technologies**: Built with HTML5 Canvas, JavaScript ES6+, and Tailwind CSS
- **Mobile Optimized**: Touch controls and responsive layout
- **Performance Optimized**: Smooth 60fps gameplay
- **Cross-Browser Compatible**: Works on all modern browsers
- **Local Storage**: Progress saved automatically in your browser

## 🎮 How to Play

### Controls
- **⬅️ Left Arrow**: Move left
- **➡️ Right Arrow**: Move right  
- **⬆️ Space Bar**: Jump
- **⏸️ ESC Key**: Pause/Resume game

### Mobile Controls
On mobile devices, use the on-screen buttons:
- **⬅️** Left button
- **⬆️** Jump button
- **➡️** Right button

### Game Objectives
1. **Survive**: Avoid all obstacles by moving left, right, or jumping
2. **Collect**: Gather as many golden coins as possible
3. **Progress**: Complete all 3 levels to achieve victory
4. **Score**: Aim for the highest coin count across all levels

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)
- Node.js and npm (for testing)

### Installation & Running

1. **Clone or download the game files**
   ```bash
   # If you have the files locally
   cd running-game
   ```

2. **Start the development server**
   ```bash
   npm run dev
   # or alternatively
   python3 -m http.server 8000
   ```

3. **Open your browser**
   ```
   http://localhost:8000
   ```

4. **Start playing!**
   - Click "New Game" to begin your adventure
   - Use "Load Game" to continue from where you left off
   - Check "How to Play" for detailed instructions

## 🧪 Testing

The game includes comprehensive Playwright tests covering all functionality.

### Setup Testing Environment

1. **Install test dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with Playwright UI mode
npm run test:ui
```

### Test Coverage

The test suite covers:
- ✅ Main menu functionality
- ✅ Game initialization and controls
- ✅ Keyboard input handling
- ✅ Mobile touch controls
- ✅ Pause/Resume functionality
- ✅ Save/Load game progress
- ✅ Responsive design across devices
- ✅ Performance and error handling
- ✅ Game completion scenarios
- ✅ UI state transitions

### Test Results

Tests run across multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

## 📱 Mobile Experience

The game is fully optimized for mobile devices:

- **Responsive Layout**: Adapts to any screen size
- **Touch Controls**: Large, easy-to-tap buttons
- **Mobile-First Design**: Optimized for touch gameplay
- **Performance Optimized**: Runs smoothly on mobile browsers
- **Landscape/Portrait**: Works in both orientations

## 🎨 Game Design

### Visual Style
- **Cute Chibi Art**: Adorable cat character with smooth animations
- **Modern UI**: Clean, colorful interface with smooth transitions
- **Themed Environments**: Each level has unique visual identity
- **Responsive Animations**: Smooth character movement and effects

### Sound Design
- **Jump Effects**: Satisfying audio feedback for jumps
- **Coin Collection**: Rewarding sound when collecting coins
- **Level Progression**: Celebratory sounds for achievements
- **Game Over**: Appropriate audio cues for different outcomes

### Level Design
1. **Forest Path** (Level 1)
   - Green, natural environment
   - Tree stumps as obstacles
   - Animated background trees
   - Gentle introduction to mechanics

2. **Desert Canyon** (Level 2)
   - Sandy, arid landscape
   - Rock formations as obstacles
   - Cacti background elements
   - Increased obstacle frequency

3. **Ice Mountain** (Level 3)
   - Snowy, crystalline environment
   - Ice spikes as obstacles
   - Falling snow particles
   - Maximum difficulty challenge

## 🛠 Technical Architecture

### File Structure
```
running-game/
├── index.html          # Main HTML file with UI
├── game.js             # Core game engine and logic
├── sounds.js           # Web Audio API sound system
├── package.json        # NPM configuration
├── playwright.config.js # Test configuration
├── tests/
│   └── game.spec.js    # Comprehensive test suite
└── README.md           # This file
```

### Core Classes
- **`CatRunnerGame`**: Main game controller and state manager
- **`Player`**: Character physics, controls, and rendering
- **`Obstacle`**: Dynamic obstacle generation and collision
- **`Coin`**: Collectible items with animation effects
- **`SoundSystem`**: Web Audio API integration

### Key Technologies
- **HTML5 Canvas**: High-performance 2D rendering
- **JavaScript ES6+**: Modern language features and modules
- **Tailwind CSS**: Utility-first CSS framework
- **Web Audio API**: Dynamic sound generation
- **LocalStorage API**: Game progress persistence
- **Playwright**: End-to-end testing framework

## 🔧 Development

### Adding New Features
1. **New Levels**: Modify the `levels` array in `game.js`
2. **New Obstacles**: Extend the `Obstacle` class with new themes
3. **Sound Effects**: Add new sounds in `sounds.js`
4. **UI Elements**: Update `index.html` and corresponding JavaScript

### Performance Optimization
- Game loop runs at 60fps using `requestAnimationFrame`
- Object pooling for obstacles and coins
- Efficient collision detection algorithms
- Canvas optimizations for smooth rendering

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: Canvas API, Web Audio API, ES6+ syntax, LocalStorage

## 🎯 Game Progression

### Scoring System
- **Coins**: Primary scoring mechanism
- **Time Bonus**: Faster completion = higher scores
- **Level Progression**: Unlock subsequent levels
- **Achievement System**: Track personal bests

### Difficulty Scaling
- **Level 1**: 0.02 obstacle frequency, 0.015 coin frequency
- **Level 2**: 0.025 obstacle frequency, 0.012 coin frequency  
- **Level 3**: 0.03 obstacle frequency, 0.01 coin frequency

## 🐛 Troubleshooting

### Common Issues

**Game won't start**
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

**No sound**
- Check browser audio settings
- Some browsers require user interaction before playing audio
- Click anywhere on the page then try again

**Controls not working**
- Make sure the game canvas has focus
- Try clicking on the game area
- Check if browser supports the required APIs

**Save/Load not working**
- Ensure browser allows localStorage
- Check if you're in private/incognito mode
- Clear browser data if corrupted

**Performance issues**
- Close other browser tabs
- Update your browser to the latest version
- Try reducing browser window size

## 🤝 Contributing

This game is designed to be easily extensible. Ideas for contributions:

- **New Levels**: Add more themed environments
- **Power-ups**: Implement special abilities
- **Multiplayer**: Add competitive features
- **Leaderboards**: Online score tracking
- **More Characters**: Add different playable animals

## 📄 License

MIT License - feel free to use and modify for your own projects!

## 🎉 Credits

**Game Design & Development**: Cat Runner Team
**Graphics**: Custom HTML5 Canvas rendering
**Sound**: Web Audio API generated effects
**Testing**: Comprehensive Playwright test suite

---

**Have fun playing Cat Runner! 🐱✨**

*For issues, suggestions, or contributions, please feel free to reach out!*