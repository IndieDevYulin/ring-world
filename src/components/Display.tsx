import { Box, Text } from "ink";
import type React from "react";
import { useMemo } from "react";
import {
	useAnimation,
	useFrameCount,
	useTypewriter,
} from "../hooks/useAnimation.js";
import { CHARS, PALETTE } from "../themes/tokens.js";

/**
 * Progress - Horizontal progress bar
 */
export interface ProgressProps {
	value: number; // 0-100
	width?: number;
	showValue?: boolean;
	color?: string;
	animated?: boolean;
}

export function Progress({
	value,
	width = 20,
	showValue = false,
	color = PALETTE.accent,
	animated = true,
}: ProgressProps) {
	const animValue = useAnimation(value, 200);
	const displayValue = animated ? animValue : value;
	const fillWidth = Math.round((displayValue / 100) * width);
	const emptyWidth = width - fillWidth;

	return (
		<Box>
			<Text color={color}>{CHARS.blocks.full.repeat(fillWidth)}</Text>
			<Text color={PALETTE.frame}>
				{CHARS.progress.barEmpty.repeat(emptyWidth)}
			</Text>
			{showValue && (
				<Text color={PALETTE.dim}> {Math.round(displayValue)}%</Text>
			)}
		</Box>
	);
}

/**
 * Spinner - Animated loading indicator
 */
export interface SpinnerProps {
	type?: "dots" | "line" | "arc" | "pulse";
	color?: string;
	label?: string;
}

const SPINNER_FRAMES = {
	dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	line: ["|", "/", "-", "\\"],
	arc: ["◜", "◠", "◝", "◞", "◡", "◟"],
	pulse: ["●", "◐", "○", "◑"],
};

export function Spinner({
	type = "dots",
	color = PALETTE.accent,
	label,
}: SpinnerProps) {
	const frame = useFrameCount();
	const frames = SPINNER_FRAMES[type];
	const currentFrame = frames[Math.floor(frame / 4) % frames.length];

	return (
		<Box>
			<Text color={color}>{currentFrame}</Text>
			{label && <Text color={PALETTE.dim}> {label}</Text>}
		</Box>
	);
}

/**
 * LoadingBar - Animated indeterminate progress
 */
export interface LoadingBarProps {
	width?: number;
	color?: string;
}

export function LoadingBar({
	width = 20,
	color = PALETTE.accent,
}: LoadingBarProps) {
	const frame = useFrameCount();
	const pos = Math.floor(frame / 3) % (width * 2);
	const actualPos = pos > width ? width * 2 - pos : pos;

	const bar = Array.from({ length: width }, (_, i) => {
		const dist = Math.abs(i - actualPos);
		if (dist === 0) return CHARS.blocks.full;
		if (dist === 1) return CHARS.blocks.dark;
		if (dist === 2) return CHARS.blocks.medium;
		if (dist === 3) return CHARS.blocks.light;
		return " ";
	}).join("");

	return <Text color={color}>{bar}</Text>;
}

/**
 * Gauge - Circular/arc gauge display
 */
export interface GaugeProps {
	value: number; // 0-100
	size?: "sm" | "md" | "lg";
	color?: string;
	showValue?: boolean;
}

const GAUGE_CHARS = "○◔◑◕●";

export function Gauge({
	value,
	size = "md",
	color = PALETTE.accent,
	showValue = true,
}: GaugeProps) {
	const animatedValue = useAnimation(value, 200);
	const charIndex = Math.floor(
		(animatedValue / 100) * (GAUGE_CHARS.length - 1),
	);
	const char = GAUGE_CHARS[charIndex];

	if (size === "sm") {
		return <Text color={color}>{char}</Text>;
	}

	if (size === "lg") {
		return (
			<Box flexDirection="column" alignItems="center">
				<Text color={color}>{char}</Text>
				{showValue && (
					<Text color={PALETTE.dim}>{Math.round(animatedValue)}%</Text>
				)}
			</Box>
		);
	}

	// Medium (default)
	return (
		<Box>
			<Text color={color}>{char}</Text>
			{showValue && (
				<Text color={PALETTE.dim}> {Math.round(animatedValue)}%</Text>
			)}
		</Box>
	);
}

/**
 * Sparkline - Tiny inline chart
 */
export interface SparklineProps {
	values: number[];
	width?: number;
	height?: 1 | 2;
	color?: string;
}

const SPARK_CHARS_1 = " ▁▂▃▄▅▆▇█";
const _SPARK_CHARS_2_TOP = " ▀▀▀▀████";
const _SPARK_CHARS_2_BOT = " ▄▄██████";

export function Sparkline({
	values,
	width,
	height = 1,
	color = PALETTE.accent,
}: SparklineProps) {
	const displayWidth = width ?? values.length;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;

	// Resample if needed
	const resampled = useMemo(() => {
		if (values.length === displayWidth) return values;

		const result: number[] = [];
		for (let i = 0; i < displayWidth; i++) {
			const srcIdx = (i / displayWidth) * values.length;
			const lowIdx = Math.floor(srcIdx);
			const highIdx = Math.min(lowIdx + 1, values.length - 1);
			const frac = srcIdx - lowIdx;
			result.push(values[lowIdx] * (1 - frac) + values[highIdx] * frac);
		}
		return result;
	}, [values, displayWidth]);

	if (height === 1) {
		const chars = resampled
			.map((v) => {
				const normalized = (v - min) / range;
				const idx = Math.round(normalized * (SPARK_CHARS_1.length - 1));
				return SPARK_CHARS_1[idx];
			})
			.join("");

		return <Text color={color}>{chars}</Text>;
	}

	// 2-row sparkline
	const topRow = resampled
		.map((v) => {
			const normalized = (v - min) / range;
			if (normalized > 0.5) return "█";
			if (normalized > 0.375) return "▀";
			return " ";
		})
		.join("");

	const botRow = resampled
		.map((v) => {
			const normalized = (v - min) / range;
			if (normalized > 0.25) return "█";
			if (normalized > 0.125) return "▄";
			return " ";
		})
		.join("");

	return (
		<Box flexDirection="column">
			<Text color={color}>{topRow}</Text>
			<Text color={color}>{botRow}</Text>
		</Box>
	);
}

/**
 * ASCIIArt - Pre-built decorative elements
 */
export interface ASCIIArtProps {
	art: "ring" | "logo" | "wave" | "corner" | "dots";
	color?: string;
	animated?: boolean;
}

const ASCII_ARTS = {
	ring: [
		"  ╭───────╮  ",
		" ╱         ╲ ",
		"│           │",
		"│     ●     │",
		"│           │",
		" ╲         ╱ ",
		"  ╰───────╯  ",
	],
	logo: [
		"┌─────────────────┐",
		"│  R I N G        │",
		"│      W O R L D  │",
		"└─────────────────┘",
	],
	wave: ["∿∿∿∿∿∿∿∿∿∿"],
	corner: ["╔══", "║", "║"],
	dots: ["· · · · ·", " · · · · ", "· · · · ·"],
};

export function ASCIIArt({
	art,
	color = PALETTE.dim,
	animated = false,
}: ASCIIArtProps) {
	const frame = useFrameCount();
	const lines = ASCII_ARTS[art];

	if (animated && art === "wave") {
		const offset = Math.floor(frame / 8) % 4;
		const chars = "∿∾≈~";
		const animatedLine = Array.from(
			{ length: 10 },
			(_, i) => chars[(i + offset) % chars.length],
		).join("");

		return <Text color={color}>{animatedLine}</Text>;
	}

	return (
		<Box flexDirection="column">
			{lines.map((line, lineIdx) => (
				<Text key={`line-${lineIdx}`} color={color}>
					{line}
				</Text>
			))}
		</Box>
	);
}

/**
 * TypewriterText - Text that types itself out
 */
export interface TypewriterTextProps {
	text: string;
	charDelay?: number;
	startDelay?: number;
	color?: string;
	cursor?: boolean;
}

export function TypewriterText({
	text,
	charDelay = 30,
	startDelay = 0,
	color = PALETTE.fg,
	cursor = true,
}: TypewriterTextProps) {
	const displayed = useTypewriter(text, charDelay, startDelay);
	const frame = useFrameCount();
	const showCursor = cursor && displayed.length < text.length;
	const cursorChar = Math.floor(frame / 15) % 2 === 0 ? "▌" : " ";

	return (
		<Text color={color}>
			{displayed}
			{showCursor && <Text color={PALETTE.accent}>{cursorChar}</Text>}
		</Text>
	);
}

/**
 * Blink - Text with blinking effect
 */
export interface BlinkProps {
	children: React.ReactNode;
	rate?: "slow" | "normal" | "fast";
	color?: string;
	dimColor?: string;
}

export function Blink({
	children,
	rate = "normal",
	color = PALETTE.accent,
	dimColor = PALETTE.dim,
}: BlinkProps) {
	const rates = { slow: 30, normal: 15, fast: 8 };
	const frame = useFrameCount();
	const isOn = Math.floor(frame / rates[rate]) % 2 === 0;

	return <Text color={isOn ? color : dimColor}>{children}</Text>;
}

/**
 * Marquee - Scrolling text
 */
export interface MarqueeProps {
	text: string;
	width: number;
	speed?: number;
	color?: string;
}

export function Marquee({
	text,
	width,
	speed = 3,
	color = PALETTE.fg,
}: MarqueeProps) {
	const frame = useFrameCount();
	const paddedText = `${text}   ${text}`;
	const offset = Math.floor(frame / speed) % (text.length + 3);
	const visible = paddedText.slice(offset, offset + width);

	return <Text color={color}>{visible.padEnd(width)}</Text>;
}
