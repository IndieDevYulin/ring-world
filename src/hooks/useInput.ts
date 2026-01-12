import { useApp, useInput } from "ink";
import { useCallback, useEffect, useRef, useState } from "react";
import { TIMING } from "../themes/tokens.js";

export type InputAction =
	| "up"
	| "down"
	| "left"
	| "right"
	| "press"
	| "doublePress"
	| "longPress"
	| "escape"
	| "tab";

export interface InputState {
	lastAction: InputAction | null;
	isLongPressing: boolean;
	pressCount: number;
}

export interface InputHandlers {
	onUp?: () => void;
	onDown?: () => void;
	onLeft?: () => void;
	onRight?: () => void;
	onPress?: () => void;
	onDoublePress?: () => void;
	onLongPress?: () => void;
	onLongPressEnd?: () => void;
	onEscape?: () => void;
	onTab?: () => void;
}

/**
 * Handle all Ring World input interactions
 */
export function useRingInput(handlers: InputHandlers = {}): InputState {
	const { exit } = useApp();

	const [state, setState] = useState<InputState>({
		lastAction: null,
		isLongPressing: false,
		pressCount: 0,
	});

	const pressStartRef = useRef<number | null>(null);
	const lastPressRef = useRef<number>(0);
	const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const doublePressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const pendingPressRef = useRef<boolean>(false);

	const clearTimers = useCallback(() => {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		if (doublePressTimerRef.current) {
			clearTimeout(doublePressTimerRef.current);
			doublePressTimerRef.current = null;
		}
	}, []);

	const dispatch = useCallback(
		(action: InputAction) => {
			setState((s) => ({ ...s, lastAction: action }));

			switch (action) {
				case "up":
					handlers.onUp?.();
					break;
				case "down":
					handlers.onDown?.();
					break;
				case "left":
					handlers.onLeft?.();
					break;
				case "right":
					handlers.onRight?.();
					break;
				case "press":
					handlers.onPress?.();
					break;
				case "doublePress":
					handlers.onDoublePress?.();
					break;
				case "longPress":
					handlers.onLongPress?.();
					break;
				case "escape":
					handlers.onEscape?.();
					break;
				case "tab":
					handlers.onTab?.();
					break;
			}
		},
		[handlers],
	);

	useInput((input, key) => {
		// Navigation
		if (key.upArrow || input === "k") {
			dispatch("up");
			return;
		}
		if (key.downArrow || input === "j") {
			dispatch("down");
			return;
		}
		if (key.leftArrow || input === "h") {
			dispatch("left");
			return;
		}
		if (key.rightArrow || input === "l") {
			dispatch("right");
			return;
		}

		// Tab
		if (key.tab) {
			dispatch("tab");
			return;
		}

		// Escape / quit
		if (key.escape || input === "q") {
			if (handlers.onEscape) {
				dispatch("escape");
			} else {
				exit();
			}
			return;
		}

		// Enter / Space - handle press variants
		if (key.return || input === " ") {
			const now = Date.now();

			// Start tracking for long press
			pressStartRef.current = now;

			// Clear any existing long press timer
			if (longPressTimerRef.current) {
				clearTimeout(longPressTimerRef.current);
			}

			// Set up long press detection
			longPressTimerRef.current = setTimeout(() => {
				setState((s) => ({ ...s, isLongPressing: true }));
				dispatch("longPress");
				pressStartRef.current = null;
				pendingPressRef.current = false;
			}, TIMING.LONG_PRESS_THRESHOLD);

			// Check for double press
			if (
				now - lastPressRef.current < TIMING.DOUBLE_PRESS_WINDOW &&
				pendingPressRef.current
			) {
				// Double press detected
				clearTimers();
				pendingPressRef.current = false;
				dispatch("doublePress");
				setState((s) => ({ ...s, pressCount: s.pressCount + 1 }));
			} else {
				// Potential single press - wait for double press window
				pendingPressRef.current = true;

				if (doublePressTimerRef.current) {
					clearTimeout(doublePressTimerRef.current);
				}

				doublePressTimerRef.current = setTimeout(() => {
					if (pendingPressRef.current && pressStartRef.current !== null) {
						// Single press confirmed (no double press came)
						if (longPressTimerRef.current) {
							clearTimeout(longPressTimerRef.current);
						}
						dispatch("press");
						setState((s) => ({ ...s, pressCount: s.pressCount + 1 }));
					}
					pendingPressRef.current = false;
				}, TIMING.DOUBLE_PRESS_WINDOW);
			}

			lastPressRef.current = now;
			return;
		}
	});

	// Cleanup on unmount
	useEffect(() => {
		return () => clearTimers();
	}, [clearTimers]);

	return state;
}

/**
 * Simplified directional navigation hook
 */
export function useDirectionalNav(
	onNavigate: (direction: "up" | "down" | "left" | "right") => void,
	onSelect?: () => void,
) {
	useRingInput({
		onUp: () => onNavigate("up"),
		onDown: () => onNavigate("down"),
		onLeft: () => onNavigate("left"),
		onRight: () => onNavigate("right"),
		onPress: onSelect,
	});
}

/**
 * Ring-specific navigation (left/right rotate, up/down for depth/layers)
 */
export function useRingNav(
	itemCount: number,
	options: {
		onSelect?: (index: number) => void;
		onBack?: () => void;
		wrap?: boolean;
	} = {},
): { index: number; setIndex: (i: number) => void } {
	const { wrap = true, onSelect, onBack } = options;
	const [index, setIndex] = useState(0);

	const move = useCallback(
		(delta: number) => {
			setIndex((current) => {
				let next = current + delta;
				if (wrap) {
					next = ((next % itemCount) + itemCount) % itemCount;
				} else {
					next = Math.max(0, Math.min(itemCount - 1, next));
				}
				return next;
			});
		},
		[itemCount, wrap],
	);

	useRingInput({
		onLeft: () => move(-1),
		onRight: () => move(1),
		onPress: () => onSelect?.(index),
		onEscape: onBack,
	});

	return { index, setIndex };
}
