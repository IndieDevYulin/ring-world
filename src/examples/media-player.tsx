#!/usr/bin/env bun

/**
 * Ring World - Media Player Example
 *
 * A sleek media player interface demonstrating:
 * - Horizontal ring for track selection
 * - Rich animations and visualizations
 * - Sophisticated ASCII art UI
 */

import { Box, render, Text } from "ink";
import { useEffect, useState } from "react";

import {
	Badge,
	Center,
	Divider,
	Footer,
	Frame,
	PALETTE,
	Progress,
	Ring,
	type RingItem,
	Row,
	Screen,
	Spinner,
	Stack,
	useFrameCount,
	usePulse,
	useRingInput,
} from "../index.js";

// ─────────────────────────────────────────────────────────────
// Track Data
// ─────────────────────────────────────────────────────────────

interface Track {
	id: string;
	title: string;
	artist: string;
	album: string;
	duration: number; // seconds
	color?: string;
}

const TRACKS: Track[] = [
	{
		id: "1",
		title: "Midnight Drive",
		artist: "Neon Pulse",
		album: "City Lights",
		duration: 234,
		color: PALETTE.accent,
	},
	{
		id: "2",
		title: "Digital Dreams",
		artist: "Synthwave Collective",
		album: "Retrograde",
		duration: 312,
		color: PALETTE.highlight,
	},
	{
		id: "3",
		title: "Chrome Hearts",
		artist: "Electric Horizon",
		album: "Voltage",
		duration: 189,
		color: PALETTE.success,
	},
	{
		id: "4",
		title: "Neon Skyline",
		artist: "Neon Pulse",
		album: "City Lights",
		duration: 267,
		color: PALETTE.warning,
	},
	{
		id: "5",
		title: "Binary Sunset",
		artist: "Data Stream",
		album: "Encoded",
		duration: 298,
		color: PALETTE.danger,
	},
	{
		id: "6",
		title: "Pulse Width",
		artist: "Modular Mind",
		album: "Oscillations",
		duration: 245,
		color: PALETTE.accent,
	},
];

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function trackToRingItem(track: Track): RingItem {
	return {
		id: track.id,
		label: track.title,
		icon: "♪",
		color: track.color,
		description: `${track.artist} • ${track.album}`,
	};
}

// ─────────────────────────────────────────────────────────────
// Audio Visualizer Component
// ─────────────────────────────────────────────────────────────

interface VisualizerProps {
	playing: boolean;
	width?: number;
	height?: number;
}

function Visualizer({ playing, width = 40, height = 5 }: VisualizerProps) {
	const frame = useFrameCount();

	// Generate animated bars
	const bars = Array.from({ length: width }, (_, i) => {
		if (!playing) return 1;

		// Create wave pattern
		const phase = (frame / 5 + i * 0.3) % (Math.PI * 2);
		const wave1 = Math.sin(phase) * 0.3;
		const wave2 = Math.sin(phase * 2.1 + i * 0.1) * 0.2;
		const wave3 = Math.sin(phase * 0.7 + i * 0.2) * 0.15;

		// Random fluctuation
		const noise = Math.sin(frame * 0.1 + i * 7) * 0.1;

		const value = 0.5 + wave1 + wave2 + wave3 + noise;
		return Math.max(0.1, Math.min(1, value));
	});

	// Render vertical bars
	const _barChars = " ▁▂▃▄▅▆▇█";

	return (
		<Box flexDirection="column">
			{Array.from({ length: height }).map((_, rowIdx) => {
				const threshold = 1 - (rowIdx + 1) / height;
				const line = bars
					.map((value, _colIdx) => {
						if (value > threshold + 0.1) return "█";
						if (value > threshold) return "▄";
						if (value > threshold - 0.1) return "▁";
						return " ";
					})
					.join("");

				return (
					<Text
						key={`viz-${rowIdx}`}
						color={playing ? PALETTE.accent : PALETTE.dim}
					>
						{line}
					</Text>
				);
			})}
		</Box>
	);
}

// ─────────────────────────────────────────────────────────────
// Now Playing Display
// ─────────────────────────────────────────────────────────────

interface NowPlayingProps {
	track: Track;
	playing: boolean;
	progress: number; // 0-1
}

function NowPlaying({ track, playing, progress }: NowPlayingProps) {
	const _pulse = usePulse(0.7, 1, 1500);
	const currentTime = Math.floor(progress * track.duration);

	return (
		<Frame width={60} style="rounded" title="Now Playing" active={playing}>
			<Stack gap={1}>
				{/* Track info */}
				<Row justify="between">
					<Text color={PALETTE.fg} bold>
						{playing ? <Text color={track.color}>▶</Text> : "■"} {track.title}
					</Text>
					<Badge color={track.color}>{track.album}</Badge>
				</Row>

				<Text color={PALETTE.dim}>{track.artist}</Text>

				<Divider width={54} style="light" />

				{/* Visualizer */}
				<Box marginY={1}>
					<Visualizer playing={playing} width={54} height={4} />
				</Box>

				{/* Progress bar */}
				<Row justify="between">
					<Text color={PALETTE.dim}>{formatTime(currentTime)}</Text>
					<Progress
						value={progress * 100}
						width={40}
						color={track.color}
						animated
					/>
					<Text color={PALETTE.dim}>{formatTime(track.duration)}</Text>
				</Row>
			</Stack>
		</Frame>
	);
}

// ─────────────────────────────────────────────────────────────
// Control Bar
// ─────────────────────────────────────────────────────────────

interface ControlBarProps {
	playing: boolean;
	onPlayPause: () => void;
	onPrev: () => void;
	onNext: () => void;
}

function _ControlBar({
	playing,
	_onPlayPause,
	_onPrev,
	_onNext,
}: ControlBarProps) {
	return (
		<Row justify="center" gap={3}>
			<Text color={PALETTE.dim}>
				<Text color={PALETTE.accent}>◀◀</Text> prev
			</Text>
			<Text color={playing ? PALETTE.accent : PALETTE.dim} bold>
				{playing ? "⏸ pause" : "▶ play"}
			</Text>
			<Text color={PALETTE.dim}>
				next <Text color={PALETTE.accent}>▶▶</Text>
			</Text>
		</Row>
	);
}

// ─────────────────────────────────────────────────────────────
// Main Media Player
// ─────────────────────────────────────────────────────────────

function MediaPlayer() {
	const [trackIndex, setTrackIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	const currentTrack = TRACKS[trackIndex];
	const ringItems = TRACKS.map(trackToRingItem);

	// Handle input
	useRingInput({
		onLeft: () => setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length),
		onRight: () => setTrackIndex((i) => (i + 1) % TRACKS.length),
		onPress: () => setPlaying((p) => !p),
		onDoublePress: () => {
			setProgress(0);
			setPlaying(true);
		},
	});

	// Simulate playback progress
	useEffect(() => {
		if (!playing) return;

		const interval = setInterval(() => {
			setProgress((p) => {
				if (p >= 1) {
					// Auto-advance to next track
					setTrackIndex((i) => (i + 1) % TRACKS.length);
					return 0;
				}
				return p + 0.002;
			});
		}, 50);

		return () => clearInterval(interval);
	}, [playing]);

	// Reset progress on track change
	useEffect(() => {
		setProgress(0);
	}, []);

	return (
		<Screen
			statusBar={
				<Row justify="between">
					<Row>
						{playing && <Spinner type="pulse" color={PALETTE.accent} />}
						{playing && <Text color={PALETTE.dim}> Playing</Text>}
						{!playing && <Text color={PALETTE.dim}>• Paused</Text>}
					</Row>
					<Text color={PALETTE.dim}>
						Track {trackIndex + 1}/{TRACKS.length}
					</Text>
				</Row>
			}
			footer={
				<Footer
					hints={[
						{ key: "←→", label: "track" },
						{ key: "Space", label: "play/pause" },
						{ key: "2×tap", label: "restart" },
						{ key: "q", label: "quit" },
					]}
				/>
			}
		>
			<Center>
				<Stack gap={2} align="center">
					{/* Album art ASCII */}
					<Frame
						width={20}
						height={7}
						style="double"
						borderColor={currentTrack.color}
					>
						<Center>
							<Stack align="center">
								<Text color={currentTrack.color} bold>
									♫
								</Text>
								<Text color={PALETTE.dim}>
									{currentTrack.album.slice(0, 12)}
								</Text>
							</Stack>
						</Center>
					</Frame>

					{/* Now playing display */}
					<NowPlaying
						track={currentTrack}
						playing={playing}
						progress={progress}
					/>

					{/* Track ring selector */}
					<Box marginTop={1}>
						<Ring
							items={ringItems}
							selectedIndex={trackIndex}
							onSelect={(_item, idx) => {
								setTrackIndex(idx);
								setProgress(0);
							}}
							visibleItems={5}
							width={60}
							showDescription={false}
							showIndicators={true}
						/>
					</Box>
				</Stack>
			</Center>
		</Screen>
	);
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────

render(<MediaPlayer />);
