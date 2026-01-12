import { Box, Text } from "ink";
import type React from "react";
import { useMemo } from "react";
import { usePulse, useStepAnimation } from "../hooks/useAnimation.js";
import { useRingNav } from "../hooks/useInput.js";
import { CHARS, PALETTE } from "../themes/tokens.js";

export interface RingItem {
	id: string;
	label: string;
	icon?: string;
	color?: string;
	description?: string;
}

export interface RingProps {
	items: RingItem[];
	selectedIndex?: number;
	onSelect?: (item: RingItem, index: number) => void;
	onBack?: () => void;
	visibleItems?: number;
	width?: number;
	showIndicators?: boolean;
	showDescription?: boolean;
	title?: string;
}

/**
 * Ring - 3D carousel navigation component
 *
 * Items are arranged in a virtual ring. The selected item appears
 * at the center with full brightness, adjacent items fade into
 * the "distance" with reduced opacity/size.
 */
export function Ring({
	items,
	selectedIndex: controlledIndex,
	onSelect,
	onBack,
	visibleItems = 5,
	width = 50,
	showIndicators = true,
	showDescription = true,
	title,
}: RingProps) {
	const isControlled = controlledIndex !== undefined;

	const { index: internalIndex, setIndex } = useRingNav(items.length, {
		onSelect: (idx) => onSelect?.(items[idx], idx),
		onBack,
	});

	const targetIndex = isControlled ? controlledIndex : internalIndex;

	// Animated position for smooth rotation
	const animatedPosition = useStepAnimation(
		targetIndex,
		items.length,
		150,
		"smoothStep",
	);

	// Subtle pulse for selected item
	const _pulseOpacity = usePulse(0.7, 1.0, 2000);

	// Calculate visible item positions and their visual properties
	const visibleSlots = useMemo(() => {
		const slots: Array<{
			item: RingItem;
			index: number;
			depth: number; // 0 = center, increases with distance
			offset: number; // Position offset from center
		}> = [];

		const halfVisible = Math.floor(visibleItems / 2);

		for (let i = -halfVisible; i <= halfVisible; i++) {
			const depth = Math.abs(i);
			let itemIndex = Math.round(animatedPosition) + i;

			// Wrap around
			itemIndex = ((itemIndex % items.length) + items.length) % items.length;

			slots.push({
				item: items[itemIndex],
				index: itemIndex,
				depth,
				offset: i,
			});
		}

		return slots;
	}, [items, animatedPosition, visibleItems]);

	// Render a single ring item with depth effects
	const renderItem = (slot: (typeof visibleSlots)[0]) => {
		const { item, depth, offset, index } = slot;
		const isSelected = depth === 0;

		// Depth-based styling
		const depthColors = [PALETTE.ringNear, PALETTE.ringMid, PALETTE.ringFar];
		const color =
			item.color ?? depthColors[Math.min(depth, depthColors.length - 1)];

		// Width shrinks with depth
		const itemWidth = width - depth * 8;
		const padding = depth * 4;

		// Build the item display
		const icon = item.icon ?? CHARS.nav.dot;
		const selector = isSelected
			? CHARS.nav.selected
			: depth === 1
				? CHARS.nav.ring
				: " ";

		// Truncate label to fit
		const maxLabelLen = itemWidth - 6;
		const label =
			item.label.length > maxLabelLen
				? `${item.label.slice(0, maxLabelLen - 1)}…`
				: item.label;

		return (
			<Box key={`${item.id}-${offset}`} paddingLeft={padding}>
				<Text color={color} dimColor={depth > 1} bold={isSelected}>
					{selector} {icon} {label}
				</Text>
			</Box>
		);
	};

	// Position indicators (dots showing ring position)
	const indicators = useMemo(() => {
		if (!showIndicators || items.length <= 1) return null;

		const maxDots = Math.min(items.length, 9);
		const selectedPos = Math.round(animatedPosition);

		return items
			.slice(0, maxDots)
			.map((_, i) => {
				const isActive = i === selectedPos % maxDots;
				return (
					<Text key={i} color={isActive ? PALETTE.accent : PALETTE.dim}>
						{isActive ? CHARS.nav.dot : CHARS.nav.ring}
					</Text>
				);
			})
			.reduce((acc, dot, i) => {
				if (i > 0) acc.push(<Text key={`sp-${i}`}> </Text>);
				acc.push(dot);
				return acc;
			}, [] as React.ReactNode[]);
	}, [items.length, animatedPosition, showIndicators, items.slice]);

	const selectedItem = items[Math.round(animatedPosition) % items.length];

	return (
		<Box flexDirection="column" width={width}>
			{/* Title bar */}
			{title && (
				<Box marginBottom={1}>
					<Text color={PALETTE.dim}>
						{CHARS.deco.diamond} {title}
					</Text>
				</Box>
			)}

			{/* Navigation hints */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Text color={PALETTE.dim}>{CHARS.nav.left} prev</Text>
				<Text color={PALETTE.dim}>next {CHARS.nav.right}</Text>
			</Box>

			{/* Ring items */}
			<Box flexDirection="column" alignItems="flex-start" paddingY={1}>
				{visibleSlots.map(renderItem)}
			</Box>

			{/* Position indicators */}
			{indicators && (
				<Box justifyContent="center" marginTop={1}>
					{indicators}
				</Box>
			)}

			{/* Description of selected item */}
			{showDescription && selectedItem?.description && (
				<Box marginTop={1} paddingX={2}>
					<Text color={PALETTE.dim} wrap="wrap">
						{selectedItem.description}
					</Text>
				</Box>
			)}

			{/* Action hints */}
			<Box marginTop={1} justifyContent="center">
				<Text color={PALETTE.dim}>
					<Text color={PALETTE.accent}>↵</Text> select
					{"  "}
					<Text color={PALETTE.accent}>⎋</Text> back
				</Text>
			</Box>
		</Box>
	);
}

/**
 * MiniRing - Compact horizontal ring selector
 * Good for secondary navigation within limited space
 */
export interface MiniRingProps {
	items: string[];
	selectedIndex?: number;
	onChange?: (index: number) => void;
	width?: number;
}

export function MiniRing({
	items,
	selectedIndex = 0,
	onChange,
	width = 40,
}: MiniRingProps) {
	const { index, setIndex } = useRingNav(items.length, {
		onSelect: (idx) => onChange?.(idx),
	});

	const currentIndex = selectedIndex ?? index;
	const animatedPos = useStepAnimation(currentIndex, items.length, 100);

	// Show 3 items: prev, current, next
	const getItem = (offset: number) => {
		const idx =
			(((Math.round(animatedPos) + offset) % items.length) + items.length) %
			items.length;
		return items[idx];
	};

	const prevItem = getItem(-1);
	const currentItem = getItem(0);
	const nextItem = getItem(1);

	// Truncate to fit
	const maxLen = Math.floor((width - 10) / 3);
	const truncate = (s: string) =>
		s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;

	return (
		<Box>
			<Text color={PALETTE.dim}>{CHARS.nav.left} </Text>
			<Text color={PALETTE.dim}>{truncate(prevItem)}</Text>
			<Text color={PALETTE.frame}> │ </Text>
			<Text color={PALETTE.fg} bold>
				{truncate(currentItem)}
			</Text>
			<Text color={PALETTE.frame}> │ </Text>
			<Text color={PALETTE.dim}>{truncate(nextItem)}</Text>
			<Text color={PALETTE.dim}> {CHARS.nav.right}</Text>
		</Box>
	);
}

/**
 * VerticalRing - Stack-based ring for menus
 */
export interface VerticalRingProps {
	items: RingItem[];
	selectedIndex?: number;
	onSelect?: (item: RingItem, index: number) => void;
	width?: number;
	maxVisible?: number;
}

export function VerticalRing({
	items,
	selectedIndex: controlledIndex,
	onSelect,
	width = 30,
	maxVisible = 7,
}: VerticalRingProps) {
	const { index, setIndex } = useRingNav(items.length, {
		onSelect: (idx) => onSelect?.(items[idx], idx),
	});

	const currentIndex = controlledIndex ?? index;
	const animatedPos = useStepAnimation(currentIndex, items.length, 120);

	// Calculate which items to show
	const halfVisible = Math.floor(maxVisible / 2);
	const startIdx = Math.round(animatedPos) - halfVisible;

	const visibleItems = useMemo(() => {
		const result: Array<{
			item: RingItem;
			distance: number;
			actualIndex: number;
		}> = [];

		for (let i = 0; i < maxVisible; i++) {
			let idx = startIdx + i;
			idx = ((idx % items.length) + items.length) % items.length;

			const distance = Math.abs(i - halfVisible);
			result.push({
				item: items[idx],
				distance,
				actualIndex: idx,
			});
		}

		return result;
	}, [items, startIdx, maxVisible, halfVisible]);

	return (
		<Box flexDirection="column" width={width}>
			{visibleItems.map(({ item, distance, actualIndex }, i) => {
				const isSelected = distance === 0;
				const color =
					distance === 0
						? PALETTE.fg
						: distance === 1
							? PALETTE.dim
							: PALETTE.frame;

				const indicator = isSelected ? CHARS.nav.arrow : " ";

				const maxLabelLen = width - 4;
				const label =
					item.label.length > maxLabelLen
						? `${item.label.slice(0, maxLabelLen - 1)}…`
						: item.label.padEnd(maxLabelLen);

				return (
					<Box key={`${item.id}-${i}`}>
						<Text color={isSelected ? PALETTE.accent : PALETTE.dim}>
							{indicator}{" "}
						</Text>
						<Text color={color} bold={isSelected} dimColor={distance > 1}>
							{item.icon ?? ""} {label}
						</Text>
					</Box>
				);
			})}
		</Box>
	);
}
