# West Cat Goes East (Rebuild)

A SNES-style 2D side-scrolling platformer featuring West Cat.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Space / W / Up | Jump |
| ESC | Pause |
| R | Toggle Auto-Run |
| T | Toggle Assist Mode |
| C | Toggle High Contrast |

## Technical Specs

- **Resolution**: 256×224 (SNES native)
- **Scaling**: 3× integer scaling
- **Engine**: Phaser 3 + TypeScript
- **Physics**: Arcade (deterministic platformer)

## SNES Constraints

- 15-bit color palette (RGB multiples of 8)
- 16×16 tile grid
- 8 max audio channels
- No sub-pixel rendering

## Project Structure

```
src/
├── config/         # Game configuration
├── constants/      # Physics constants
├── entities/       # Player, enemies
├── levels/         # Level data
├── scenes/         # Phaser scenes
├── ui/             # HUD components
└── utils/          # SNES validators
```

## Development

Built with the Anti-Gravity IDE following SNES platformer guide workflows.
