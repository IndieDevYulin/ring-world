/**
 * Ring World Design Tokens
 *
 * Optimized for 640x350 pixel display with Proggy Clean Tiny font
 * Proggy Clean Tiny: ~7x13 pixels per character
 * Grid: 91 columns × 26 rows (usable: 89×24 with frame)
 */

export const DISPLAY = {
	// Physical dimensions
	WIDTH_PX: 640,
	HEIGHT_PX: 350,

	// Character cell size (Proggy Clean Tiny)
	CELL_WIDTH: 7,
	CELL_HEIGHT: 13,

	// Terminal grid
	COLS: 91,
	ROWS: 26,

	// Safe area (inside standard frame)
	SAFE_COLS: 87,
	SAFE_ROWS: 22,
} as const;

export const TIMING = {
	// Animation durations (ms)
	INSTANT: 0,
	FAST: 80,
	NORMAL: 150,
	SLOW: 300,
	GLACIAL: 500,

	// Easing tick rate
	FRAME_MS: 16, // ~60fps

	// Input timings
	DOUBLE_PRESS_WINDOW: 250,
	LONG_PRESS_THRESHOLD: 400,
	REPEAT_DELAY: 300,
	REPEAT_RATE: 50,
} as const;

export const PALETTE = {
	// Core colors - muted, industrial
	fg: "#c5c8c6", // Warm gray text
	bg: "#1d1f21", // Deep charcoal
	dim: "#5c5e5f", // Muted secondary
	accent: "#81a2be", // Steel blue
	highlight: "#f0c674", // Amber highlight
	success: "#8c9440", // Olive green
	warning: "#de935f", // Burnt orange
	danger: "#a54242", // Muted red

	// Frame colors
	frame: "#373b41", // Border gray
	frameActive: "#707880", // Active border

	// Ring-specific
	ringNear: "#c5c8c6", // Items close to viewport
	ringMid: "#969896", // Mid-distance items
	ringFar: "#5c5e5f", // Far items (depth fade)
} as const;

// Box drawing characters - sophisticated but subtle
export const CHARS = {
	// Light frames (default)
	light: {
		tl: "┌",
		tr: "┐",
		bl: "└",
		br: "┘",
		h: "─",
		v: "│",
		lt: "├",
		rt: "┤",
		tt: "┬",
		bt: "┴",
		cross: "┼",
	},

	// Heavy frames (emphasis)
	heavy: {
		tl: "┏",
		tr: "┓",
		bl: "┗",
		br: "┛",
		h: "━",
		v: "┃",
		lt: "┣",
		rt: "┫",
		tt: "┳",
		bt: "┻",
		cross: "╋",
	},

	// Double frames (headers/titles)
	double: {
		tl: "╔",
		tr: "╗",
		bl: "╚",
		br: "╝",
		h: "═",
		v: "║",
		lt: "╠",
		rt: "╣",
		tt: "╦",
		bt: "╩",
		cross: "╬",
	},

	// Rounded (soft UI)
	rounded: {
		tl: "╭",
		tr: "╮",
		bl: "╰",
		br: "╯",
		h: "─",
		v: "│",
		lt: "├",
		rt: "┤",
		tt: "┬",
		bt: "┴",
		cross: "┼",
	},

	// Block elements for depth/shading
	blocks: {
		full: "█",
		dark: "▓",
		medium: "▒",
		light: "░",
		upper: "▀",
		lower: "▄",
		left: "▌",
		right: "▐",
	},

	// Navigation indicators
	nav: {
		up: "▲",
		down: "▼",
		left: "◀",
		right: "▶",
		dot: "●",
		ring: "○",
		selected: "◉",
		bullet: "•",
		arrow: "→",
	},

	// Progress/loading
	progress: {
		empty: "○",
		partial: "◐",
		full: "●",
		barEmpty: "░",
		barFull: "█",
	},

	// Decorative
	deco: {
		star: "✦",
		diamond: "◆",
		square: "■",
		check: "✓",
		cross: "✗",
		ellipsis: "…",
	},
} as const;

// Semantic spacing (in characters)
export const SPACING = {
	none: 0,
	xs: 1,
	sm: 2,
	md: 3,
	lg: 4,
	xl: 6,
} as const;

export type FrameStyle = keyof typeof CHARS &
	("light" | "heavy" | "double" | "rounded");
export type ColorKey = keyof typeof PALETTE;
