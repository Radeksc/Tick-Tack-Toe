# 3D Tic-Tac-Toe Game

A beautiful 3D Tic-Tac-Toe game built with React and Three.js, featuring a 5x5 game board with automatic rotation and stunning visual effects.

## Features

- 🎮 5x5 Tic-Tac-Toe board (need 5 in a row to win)
- 🎨 3D graphics powered by Three.js
- ✨ Automatic board rotation
- 💡 Dynamic lighting effects
- 🎯 Interactive click-to-place pieces
- 🏆 Win detection for rows, columns, and diagonals
- 🔄 Reset game functionality

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Radeksc/Tick-Tack-Toe.git
cd Tick-Tack-Toe

# Install dependencies (if package.json exists)
npm install

# Start the development server
npm start
```

## How to Play

1. Click on any empty square on the 3D board to place your piece
2. Players alternate between X (red) and O (blue)
3. Get 5 in a row (horizontal, vertical, or diagonal) to win
4. Click "New Game" to reset and play again

## Technology Stack

- **React** - UI framework
- **Three.js** - 3D graphics library
- **Tailwind CSS** - Styling (based on class names in code)

## Project Structure

```
Tick-Tack-Toe/
├── app.js          # Main game component
├── CODE_REVIEW.md  # Detailed code review and recommendations
└── README.md       # This file
```

## Code Review

A comprehensive code review has been performed on this project. See [CODE_REVIEW.md](./CODE_REVIEW.md) for:
- Critical issues identified
- Code quality improvements
- Best practices recommendations
- Performance optimizations
- Security considerations

### Critical Issues to Address

1. **Memory Leak**: Animation frame not cancelled on component unmount
2. **useEffect Dependencies**: Incomplete dependencies array
3. **Null Checks**: Missing validation in addPiece function

See CODE_REVIEW.md for detailed explanations and fixes.

## Future Enhancements

- [ ] Add keyboard navigation for accessibility
- [ ] Implement undo/redo functionality
- [ ] Add game history tracking
- [ ] Implement AI opponent
- [ ] Add sound effects
- [ ] Create different board sizes (3x3, 4x4)
- [ ] Add multiplayer support
- [ ] Implement mobile touch controls
- [ ] Add unit tests

## Contributing

Contributions are welcome! Please review the CODE_REVIEW.md for coding standards and best practices.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Three.js community for excellent 3D rendering library
- React team for the amazing framework

## Contact

For questions or suggestions, please open an issue on GitHub.
