import { useEffect, useRef, useState } from "react";
import { TIMING } from "../themes/tokens.js";

/**
 * Easing functions for smooth animations
 */
export const ease = {
	linear: (t: number) => t,

	// Quad
	inQuad: (t: number) => t * t,
	outQuad: (t: number) => t * (2 - t),
	inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

	// Cubic
	inCubic: (t: number) => t * t * t,
	outCubic: (t: number) => --t * t * t + 1,
	inOutCubic: (t: number) =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

	// Elastic (subtle bounce)
	outElastic: (t: number) => {
		const p = 0.3;
		return 2 ** (-10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
	},

	// Back (overshoot)
	outBack: (t: number) => {
		const s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	},

	// Smooth step (good for ring rotation)
	smoothStep: (t: number) => t * t * (3 - 2 * t),

	// Snap (quick start, smooth end)
	snap: (t: number) => {
		const p = 0.5;
		return t < p ? 0.5 * (2 * t) ** 2 : 0.5 * (2 - (2 * (1 - t)) ** 2);
	},
} as const;

export type EaseFn = keyof typeof ease;

/**
 * Animate a value from start to end
 */
export function useAnimation(
	target: number,
	duration: number = TIMING.NORMAL,
	easeFn: EaseFn = "outCubic",
): number {
	const [current, setCurrent] = useState(target);
	const startRef = useRef(current);
	const startTimeRef = useRef<number | null>(null);
	const frameRef = useRef<number>();

	useEffect(() => {
		if (current === target) return;

		startRef.current = current;
		startTimeRef.current = Date.now();

		const animate = () => {
			const elapsed = Date.now() - (startTimeRef.current ?? 0);
			const progress = Math.min(elapsed / duration, 1);
			const eased = ease[easeFn](progress);

			const newValue = startRef.current + (target - startRef.current) * eased;
			setCurrent(newValue);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(animate);
			}
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [target, duration, easeFn, current]);

	return current;
}

/**
 * Animate between discrete steps (for ring index)
 */
export function useStepAnimation(
	target: number,
	total: number,
	duration: number = TIMING.NORMAL,
	easeFn: EaseFn = "smoothStep",
): number {
	const [current, setCurrent] = useState(target);
	const startRef = useRef(current);
	const startTimeRef = useRef<number | null>(null);
	const frameRef = useRef<number>();

	useEffect(() => {
		if (Math.abs(current - target) < 0.001) {
			setCurrent(target);
			return;
		}

		// Calculate shortest path around the ring
		let delta = target - current;
		if (Math.abs(delta) > total / 2) {
			delta = delta > 0 ? delta - total : delta + total;
		}

		startRef.current = current;
		const endValue = current + delta;
		startTimeRef.current = Date.now();

		const animate = () => {
			const elapsed = Date.now() - (startTimeRef.current ?? 0);
			const progress = Math.min(elapsed / duration, 1);
			const eased = ease[easeFn](progress);

			let newValue = startRef.current + (endValue - startRef.current) * eased;

			// Normalize to [0, total)
			while (newValue < 0) newValue += total;
			while (newValue >= total) newValue -= total;

			setCurrent(newValue);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(animate);
			} else {
				setCurrent(target);
			}
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [target, total, duration, easeFn, current]);

	return current;
}

/**
 * Spring physics animation
 */
export function useSpring(
	target: number,
	config: { stiffness?: number; damping?: number; mass?: number } = {},
): number {
	const { stiffness = 180, damping = 12, mass = 1 } = config;

	const [current, setCurrent] = useState(target);
	const velocityRef = useRef(0);
	const frameRef = useRef<number>();

	useEffect(() => {
		const animate = () => {
			const displacement = current - target;
			const springForce = -stiffness * displacement;
			const dampingForce = -damping * velocityRef.current;
			const acceleration = (springForce + dampingForce) / mass;

			velocityRef.current += acceleration * 0.016; // ~60fps timestep
			const newValue = current + velocityRef.current * 0.016;

			setCurrent(newValue);

			// Stop when settled
			if (
				Math.abs(velocityRef.current) < 0.01 &&
				Math.abs(displacement) < 0.01
			) {
				setCurrent(target);
				velocityRef.current = 0;
			} else {
				frameRef.current = requestAnimationFrame(animate);
			}
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [target, stiffness, damping, mass, current]);

	return current;
}

/**
 * Oscillating value (for subtle breathing effects)
 */
export function usePulse(
	min: number,
	max: number,
	periodMs: number = 2000,
): number {
	const [value, setValue] = useState(min);

	useEffect(() => {
		const startTime = Date.now();
		let frameId: number;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const phase = (elapsed % periodMs) / periodMs;
			const sine = Math.sin(phase * Math.PI * 2);
			const normalized = (sine + 1) / 2; // 0 to 1
			setValue(min + (max - min) * normalized);
			frameId = requestAnimationFrame(animate);
		};

		frameId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frameId);
	}, [min, max, periodMs]);

	return value;
}

/**
 * Delayed visibility (for staggered reveals)
 */
export function useDelayedVisible(delayMs: number): boolean {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setVisible(true), delayMs);
		return () => clearTimeout(timer);
	}, [delayMs]);

	return visible;
}

/**
 * Typewriter text effect
 */
export function useTypewriter(
	text: string,
	charDelayMs: number = 30,
	startDelayMs: number = 0,
): string {
	const [displayed, setDisplayed] = useState("");
	const indexRef = useRef(0);

	useEffect(() => {
		setDisplayed("");
		indexRef.current = 0;

		const startTimer = setTimeout(() => {
			const interval = setInterval(() => {
				if (indexRef.current < text.length) {
					setDisplayed(text.slice(0, ++indexRef.current));
				} else {
					clearInterval(interval);
				}
			}, charDelayMs);

			return () => clearInterval(interval);
		}, startDelayMs);

		return () => clearTimeout(startTimer);
	}, [text, charDelayMs, startDelayMs]);

	return displayed;
}

/**
 * Frame counter for custom animations
 */
export function useFrameCount(): number {
	const [frame, setFrame] = useState(0);

	useEffect(() => {
		let frameId: number;
		const animate = () => {
			setFrame((f) => f + 1);
			frameId = requestAnimationFrame(animate);
		};
		frameId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frameId);
	}, []);

	return frame;
}

/**
 * Interpolate between values in an array based on position
 */
export function interpolate(values: number[], position: number): number {
	const len = values.length;
	if (len === 0) return 0;
	if (len === 1) return values[0];

	const index = Math.floor(position);
	const fraction = position - index;
	const i1 = ((index % len) + len) % len;
	const i2 = (((index + 1) % len) + len) % len;

	return values[i1] + (values[i2] - values[i1]) * fraction;
}
