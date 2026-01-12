import { Box, Text } from "ink";
import type React from "react";
import { useMemo } from "react";
import { CHARS, type FrameStyle, PALETTE } from "../themes/tokens.js";

export interface FrameProps {
	children?: React.ReactNode;
	width?: number | string;
	height?: number;
	style?: FrameStyle;
	title?: string;
	titleAlign?: "left" | "center" | "right";
	borderColor?: string;
	active?: boolean;
	padding?: number;
	shadow?: boolean;
}

/**
 * Frame - A container with ASCII box-drawing borders
 * Sophisticated but unobtrusive chrome for Ring World
 */
export function Frame({
	children,
	width,
	height,
	style = "light",
	title,
	titleAlign = "left",
	borderColor,
	active = false,
	padding = 1,
	shadow = false,
}: FrameProps) {
	const chars = CHARS[style];
	const color = borderColor ?? (active ? PALETTE.frameActive : PALETTE.frame);

	// Calculate inner dimensions
	const innerWidth = typeof width === "number" ? width - 2 : undefined;
	const innerHeight = height ? height - 2 : undefined;

	// Build title bar
	const titleBar = useMemo(() => {
		if (!title || !innerWidth) return null;

		const maxTitleLen = innerWidth - 4; // Leave space for brackets and padding
		const displayTitle =
			title.length > maxTitleLen
				? `${title.slice(0, maxTitleLen - 1)}…`
				: title;

		const titleWithBrackets = `┤ ${displayTitle} ├`;
		const remainingWidth = innerWidth - titleWithBrackets.length + 2;

		if (titleAlign === "center") {
			const leftPad = Math.floor(remainingWidth / 2);
			const rightPad = remainingWidth - leftPad;
			return (
				chars.h.repeat(leftPad) + titleWithBrackets + chars.h.repeat(rightPad)
			);
		} else if (titleAlign === "right") {
			return chars.h.repeat(remainingWidth) + titleWithBrackets;
		} else {
			return titleWithBrackets + chars.h.repeat(remainingWidth);
		}
	}, [title, innerWidth, titleAlign, chars.h]);

	// Top border
	const topBorder = titleBar
		? chars.tl + titleBar + chars.tr
		: chars.tl + chars.h.repeat(innerWidth ?? 0) + chars.tr;

	// Bottom border
	const bottomBorder = chars.bl + chars.h.repeat(innerWidth ?? 0) + chars.br;

	return (
		<Box flexDirection="column">
			{/* Top border */}
			<Text color={color}>{topBorder}</Text>

			{/* Content area */}
			<Box flexDirection="row" height={innerHeight}>
				{/* Left border */}
				<Box flexDirection="column">
					{innerHeight !== undefined ? (
						Array.from({ length: innerHeight }).map((_, rowIdx) => (
							<Text key={`left-${rowIdx}`} color={color}>
								{chars.v}
							</Text>
						))
					) : (
						<Text color={color}>{chars.v}</Text>
					)}
				</Box>

				{/* Inner content */}
				<Box flexDirection="column" paddingX={padding} width={innerWidth}>
					{children}
				</Box>

				{/* Right border */}
				<Box flexDirection="column">
					{innerHeight !== undefined ? (
						Array.from({ length: innerHeight }).map((_, rowIdx) => (
							<Text key={`right-${rowIdx}`} color={color}>
								{chars.v}
							</Text>
						))
					) : (
						<Text color={color}>{chars.v}</Text>
					)}
				</Box>

				{/* Shadow (optional) */}
				{shadow && (
					<Box flexDirection="column" marginLeft={0}>
						{innerHeight !== undefined ? (
							Array.from({ length: innerHeight }).map((_, rowIdx) => (
								<Text key={`shadow-${rowIdx}`} color={PALETTE.dim}>
									{CHARS.blocks.medium}
								</Text>
							))
						) : (
							<Text color={PALETTE.dim}>{CHARS.blocks.medium}</Text>
						)}
					</Box>
				)}
			</Box>

			{/* Bottom border */}
			<Box>
				<Text color={color}>{bottomBorder}</Text>
				{shadow && <Text color={PALETTE.dim}>{CHARS.blocks.medium}</Text>}
			</Box>

			{/* Shadow bottom */}
			{shadow && (
				<Text color={PALETTE.dim}>
					{` ${CHARS.blocks.medium.repeat((innerWidth ?? 0) + 2)}`}
				</Text>
			)}
		</Box>
	);
}

/**
 * Divider - Horizontal line for separating content
 */
export interface DividerProps {
	width?: number;
	style?: FrameStyle;
	color?: string;
	label?: string;
}

export function Divider({
	width = 40,
	style = "light",
	color = PALETTE.frame,
	label,
}: DividerProps) {
	const char = CHARS[style].h;

	if (label) {
		const labelPart = ` ${label} `;
		const remaining = width - labelPart.length;
		const left = Math.floor(remaining / 2);
		const right = remaining - left;
		return (
			<Text color={color}>
				{char.repeat(left)}
				{labelPart}
				{char.repeat(right)}
			</Text>
		);
	}

	return <Text color={color}>{char.repeat(width)}</Text>;
}

/**
 * Badge - Small labeled indicator
 */
export interface BadgeProps {
	children: string;
	color?: string;
	bgColor?: string;
	variant?: "filled" | "outline";
}

export function Badge({
	children,
	color = PALETTE.accent,
	variant = "outline",
}: BadgeProps) {
	if (variant === "filled") {
		return (
			<Text backgroundColor={color} color={PALETTE.bg}>
				{" "}
				{children}{" "}
			</Text>
		);
	}

	return (
		<Text color={color}>
			{"["}
			{children}
			{"]"}
		</Text>
	);
}

/**
 * StatusDot - Tiny status indicator
 */
export interface StatusDotProps {
	status: "success" | "warning" | "danger" | "info" | "neutral";
	pulse?: boolean;
}

export function StatusDot({ status, pulse }: StatusDotProps) {
	const colors: Record<string, string> = {
		success: PALETTE.success,
		warning: PALETTE.warning,
		danger: PALETTE.danger,
		info: PALETTE.accent,
		neutral: PALETTE.dim,
	};

	return (
		<Text color={colors[status]}>{pulse ? CHARS.nav.ring : CHARS.nav.dot}</Text>
	);
}
