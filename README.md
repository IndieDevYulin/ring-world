# Ring World

A TUI (Terminal User Interface) library for tiny displays, built on [Ink](https://github.com/vadimdemedes/ink). Optimized for **640×350 pixel** displays using **Proggy Clean Tiny** font.

```
  ╭───────╮  
 ╱         ╲ 
│           │
│     ●     │
│           │
 ╲         ╱ 
  ╰───────╯  
```

## Features

- **3D Ring Navigation**: Carousel-style navigation with depth effects and smooth animations
- **Tiny Display Optimized**: 91×26 character grid perfectly fits 640×350px @ Proggy Clean Tiny
- **Sophisticated ASCII Art**: Box-drawing characters, progress bars, gauges, and visualizers
- **Rich Animations**: Spring physics, easing functions, typewriter effects, and more
- **Flexible Input Handling**: Supports up/down/left/right, press, double-press, and long-press
- **Industrial Design Language**: Muted, professional color palette with subtle accents

## Installation

```bash
bun add ring-world
# or
npm install ring-world
```

## Quick Start

```tsx
import React from 'react';
import { render } from 'ink';
import { Ring, Screen, type RingItem } from 'ring-world';

const items: RingItem[] = [
  { id: '1', label: 'Dashboard', icon: '◈', description: 'System overview' },
  { id: '2', label: 'Settings', icon: '⚙', description: 'Configuration' },
  { id: '3', label: 'Files', icon: '▤', description: 'File browser' },
];

function App() {
  return (
    <Screen title="My App">
      <Ring
        items={items}
        onSelect={(item) => console.log('Selected:', item.label)}
      />
    </Screen>
  );
}

render(<App />);
```

## Controls

| Key | Action |
|-----|--------|
| `←` `→` or `h` `l` | Navigate ring horizontally |
| `↑` `↓` or `k` `j` | Navigate vertically |
| `Enter` or `Space` | Select / Press |
| `Enter` × 2 | Double press (quick succession) |
| `Enter` (hold) | Long press (400ms+) |
| `Esc` or `q` | Back / Exit |

## Components

### Layout

- **`Screen`** - Root container optimized for 640×350
- **`Split`** - Two-pane layout (horizontal/vertical)
- **`Grid`** - Grid layout for widgets
- **`Stack`** - Vertical stack with spacing
- **`Row`** - Horizontal row with spacing
- **`Card`** - Compact framed content block
- **`Center`** - Center content

### Navigation

- **`Ring`** - Main 3D carousel navigation
- **`MiniRing`** - Compact horizontal ring selector
- **`VerticalRing`** - Stack-based ring for menus

### Display Elements

- **`Frame`** - ASCII box-drawing border container
- **`Progress`** - Horizontal progress bar
- **`Spinner`** - Animated loading indicator (dots, arc, pulse)
- **`LoadingBar`** - Indeterminate progress animation
- **`Gauge`** - Circular gauge display
- **`Sparkline`** - Inline mini chart
- **`TypewriterText`** - Text that types itself
- **`Marquee`** - Scrolling text
- **`Blink`** - Blinking text effect
- **`ASCIIArt`** - Pre-built decorative elements

### Utilities

- **`Divider`** - Horizontal separator
- **`Badge`** - Small labeled indicator
- **`StatusDot`** - Tiny status indicator
- **`Header`** - Styled header bar
- **`Footer`** - Bottom navigation/status

## Hooks

### Animation

```tsx
import { useAnimation, useSpring, usePulse } from 'ring-world';

// Animate to target value
const value = useAnimation(targetValue, 200, 'outCubic');

// Spring physics
const springValue = useSpring(target, { stiffness: 180, damping: 12 });

// Oscillating value
const opacity = usePulse(0.5, 1.0, 2000);
```

### Input

```tsx
import { useRingInput, useRingNav } from 'ring-world';

// Full input handling
useRingInput({
  onUp: () => {},
  onDown: () => {},
  onLeft: () => {},
  onRight: () => {},
  onPress: () => {},
  onDoublePress: () => {},
  onLongPress: () => {},
  onEscape: () => {},
});

// Simplified ring navigation
const { index, setIndex } = useRingNav(itemCount, {
  onSelect: (index) => {},
  onBack: () => {},
  wrap: true,
});
```

## Design Tokens

### Display Constants

```tsx
import { DISPLAY, PALETTE, CHARS, TIMING } from 'ring-world';

DISPLAY.COLS    // 91 - Terminal columns
DISPLAY.ROWS    // 26 - Terminal rows
DISPLAY.WIDTH_PX  // 640
DISPLAY.HEIGHT_PX // 350
```

### Color Palette

```tsx
PALETTE.fg        // #c5c8c6 - Primary text
PALETTE.bg        // #1d1f21 - Background
PALETTE.dim       // #5c5e5f - Secondary text
PALETTE.accent    // #81a2be - Steel blue accent
PALETTE.highlight // #f0c674 - Amber highlight
PALETTE.success   // #8c9440 - Olive green
PALETTE.warning   // #de935f - Burnt orange
PALETTE.danger    // #a54242 - Muted red
```

### Box Drawing Characters

```tsx
CHARS.light   // ┌ ─ ┐ │ └ ┘
CHARS.heavy   // ┏ ━ ┓ ┃ ┗ ┛
CHARS.double  // ╔ ═ ╗ ║ ╚ ╝
CHARS.rounded // ╭ ─ ╮ │ ╰ ╯
CHARS.blocks  // █ ▓ ▒ ░ ▀ ▄
CHARS.nav     // ▲ ▼ ◀ ▶ ● ○ ◉
```

## Examples

Run the included examples:

```bash
# Main demo
bun run src/examples/demo.tsx

# File browser
bun run src/examples/file-browser.tsx

# Media player
bun run src/examples/media-player.tsx
```

## Display Setup

For best results with a 640×350 pixel display:

1. Use **Proggy Clean Tiny** font (7×13 pixels per character)
2. Terminal size: 91 columns × 26 rows
3. Disable terminal padding/margins

### Font Download

[Proggy Clean](https://www.proggyfonts.net/download/) - Use the "Tiny" variant

## Design Philosophy

Ring World follows these principles:

1. **Efficiency First**: Every pixel counts on a tiny display
2. **Depth Through ASCII**: Box-drawing creates visual hierarchy without consuming space
3. **Smooth Interaction**: Animations provide feedback without distraction
4. **Industrial Aesthetic**: Muted colors, subtle accents, professional appearance
5. **Consistent Patterns**: Familiar navigation across all components

## License

MIT © 2025
