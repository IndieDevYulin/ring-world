import { Box, Text } from "ink";
import React, { useMemo } from "react";
import { CHARS, DISPLAY, type FrameStyle, PALETTE } from "../themes/tokens.js";
import { Frame } from "./Frame.js";

/**
 * Screen - Root container optimized for 640x350 display
 * Provides consistent framing and layout structure
 */
export interface ScreenProps {
	children: React.ReactNode;
	title?: string;
	statusBar?: React.ReactNode;
	footer?: React.ReactNode;
	padding?: number;
}

export function Screen({
	children,
	title,
	statusBar,
	footer,
	padding = 1,
}: ScreenProps) {
	return (
		<Box flexDirection="column" width={DISPLAY.COLS} height={DISPLAY.ROWS}>
			{/* Status bar */}
			{statusBar && (
				<Box paddingX={1} marginBottom={0}>
					{statusBar}
				</Box>
			)}

			{/* Title */}
			{title && (
				<Box justifyContent="center" marginBottom={1}>
					<Text color={PALETTE.fg} bold>
						{CHARS.deco.diamond} {title} {CHARS.deco.diamond}
					</Text>
				</Box>
			)}

			{/* Main content */}
			<Box flexDirection="column" flexGrow={1} paddingX={padding}>
				{children}
			</Box>

			{/* Footer */}
			{footer && (
				<Box paddingX={1} marginTop={0}>
					{footer}
				</Box>
			)}
		</Box>
	);
}

/**
 * Split - Two-pane layout (horizontal or vertical)
 */
export interface SplitProps {
	children: [React.ReactNode, React.ReactNode];
	direction?: "horizontal" | "vertical";
	ratio?: number; // First pane ratio (0-1)
	divider?: boolean;
	gap?: number;
}

export function Split({
	children,
	direction = "horizontal",
	ratio = 0.5,
	divider = true,
	gap = 1,
}: SplitProps) {
	const [first, second] = children;
	const isHorizontal = direction === "horizontal";

	return (
		<Box flexDirection={isHorizontal ? "row" : "column"} flexGrow={1}>
			<Box flexGrow={ratio * 10}>{first}</Box>

			{divider && (
				<Box
					flexDirection={isHorizontal ? "column" : "row"}
					paddingX={isHorizontal ? gap : 0}
					paddingY={isHorizontal ? 0 : gap}
				>
					{isHorizontal ? (
						<Text color={PALETTE.frame}>{CHARS.light.v}</Text>
					) : (
						<Text color={PALETTE.frame}>
							{CHARS.light.h.repeat(DISPLAY.COLS - 4)}
						</Text>
					)}
				</Box>
			)}

			<Box flexGrow={(1 - ratio) * 10}>{second}</Box>
		</Box>
	);
}

/**
 * Grid - Simple grid layout for widgets
 */
export interface GridProps {
	children: React.ReactNode[];
	columns: number;
	gap?: number;
	cellWidth?: number;
}

export function Grid({ children, columns, gap = 1, cellWidth }: GridProps) {
	const rows = useMemo(() => {
		const result: React.ReactNode[][] = [];
		let current: React.ReactNode[] = [];

		React.Children.forEach(children, (child, _i) => {
			current.push(child);
			if (current.length === columns) {
				result.push(current);
				current = [];
			}
		});

		if (current.length > 0) {
			// Pad last row
			while (current.length < columns) {
				current.push(null);
			}
			result.push(current);
		}

		return result;
	}, [children, columns]);

	return (
		<Box flexDirection="column" gap={gap}>
			{rows.map((row, rowIdx) => (
				<Box key={`row-${rowIdx}`} gap={gap}>
					{row.map((cell, colIdx) => (
						<Box
							key={`cell-${rowIdx}-${colIdx}`}
							width={cellWidth}
							flexGrow={cellWidth ? 0 : 1}
						>
							{cell}
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
}

/**
 * Stack - Vertical stack with consistent spacing
 */
export interface StackProps {
	children: React.ReactNode;
	gap?: number;
	align?: "left" | "center" | "right";
}

export function Stack({ children, gap = 0, align = "left" }: StackProps) {
	const alignItems =
		align === "center"
			? "center"
			: align === "right"
				? "flex-end"
				: "flex-start";

	return (
		<Box flexDirection="column" gap={gap} alignItems={alignItems}>
			{children}
		</Box>
	);
}

/**
 * Row - Horizontal row with consistent spacing
 */
export interface RowProps {
	children: React.ReactNode;
	gap?: number;
	justify?: "start" | "center" | "end" | "between";
}

export function Row({ children, gap = 1, justify = "start" }: RowProps) {
	const justifyContent: "flex-start" | "center" | "flex-end" | "space-between" =
		{
			start: "flex-start",
			center: "center",
			end: "flex-end",
			between: "space-between",
		}[justify];

	return (
		<Box gap={gap} justifyContent={justifyContent}>
			{children}
		</Box>
	);
}

/**
 * Card - Compact framed content block
 */
export interface CardProps {
	children: React.ReactNode;
	title?: string;
	width?: number;
	active?: boolean;
	style?: FrameStyle;
}

export function Card({
	children,
	title,
	width = 25,
	active = false,
	style = "rounded",
}: CardProps) {
	return (
		<Frame
			width={width}
			style={style}
			title={title}
			active={active}
			padding={1}
		>
			{children}
		</Frame>
	);
}

/**
 * Header - Styled header bar
 */
export interface HeaderProps {
	title: string;
	left?: React.ReactNode;
	right?: React.ReactNode;
	style?: "simple" | "boxed" | "underline";
}

export function Header({ title, left, right, style = "simple" }: HeaderProps) {
	if (style === "boxed") {
		return (
			<Box marginBottom={1}>
				<Text color={PALETTE.frame}>{CHARS.double.tl}</Text>
				<Text color={PALETTE.fg} bold>
					{" "}
					{title}{" "}
				</Text>
				<Text color={PALETTE.frame}>{CHARS.double.tr}</Text>
			</Box>
		);
	}

	if (style === "underline") {
		return (
			<Box flexDirection="column" marginBottom={1}>
				<Box justifyContent="space-between">
					{left ?? <Text> </Text>}
					<Text color={PALETTE.fg} bold>
						{title}
					</Text>
					{right ?? <Text> </Text>}
				</Box>
				<Text color={PALETTE.frame}>
					{CHARS.heavy.h.repeat(title.length + 4)}
				</Text>
			</Box>
		);
	}

	// Simple (default)
	return (
		<Box justifyContent="space-between" marginBottom={1}>
			{left ?? <Text> </Text>}
			<Text color={PALETTE.fg} bold>
				{CHARS.deco.diamond} {title}
			</Text>
			{right ?? <Text> </Text>}
		</Box>
	);
}

/**
 * Footer - Bottom navigation/status bar
 */
export interface FooterProps {
	children?: React.ReactNode;
	hints?: Array<{ key: string; label: string }>;
}

export function Footer({ children, hints }: FooterProps) {
	if (hints) {
		return (
			<Box justifyContent="center" gap={2}>
				{hints.map(({ key, label }, hintIdx) => (
					<Box key={`hint-${hintIdx}`}>
						<Text color={PALETTE.accent}>{key}</Text>
						<Text color={PALETTE.dim}> {label}</Text>
					</Box>
				))}
			</Box>
		);
	}

	return <Box justifyContent="center">{children}</Box>;
}

/**
 * Spacer - Flexible space filler
 */
export function Spacer() {
	return <Box flexGrow={1} />;
}

/**
 * Center - Center content horizontally and/or vertically
 */
export interface CenterProps {
	children: React.ReactNode;
	horizontal?: boolean;
	vertical?: boolean;
}

export function Center({
	children,
	horizontal = true,
	vertical = true,
}: CenterProps) {
	return (
		<Box
			flexGrow={1}
			justifyContent={horizontal ? "center" : "flex-start"}
			alignItems={vertical ? "center" : "flex-start"}
		>
			{children}
		</Box>
	);
}
