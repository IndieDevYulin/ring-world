#!/usr/bin/env bun

/**
 * Ring World Demo
 *
 * Showcases the Ring World TUI library for tiny displays.
 * Optimized for 640x350px with Proggy Clean Tiny font.
 *
 * Controls:
 *   ←/→ or h/l  Navigate ring
 *   ↑/↓ or k/j  Navigate vertically
 *   Enter/Space Select (double-tap for secondary action)
 *   Esc/q       Back/Exit
 */

import { Box, render, Text } from "ink";
import React, { useCallback, useState } from "react";

import {
	ASCIIArt,
	Badge,
	Blink,
	Card,
	Center,
	Divider,
	Footer,
	Gauge,
	Grid,
	LoadingBar,
	Marquee,
	PALETTE,
	// Display elements
	Progress,
	// Ring navigation
	Ring,
	type RingItem,
	Row,
	// Layout
	Screen,
	Sparkline,
	Spinner,
	Split,
	Stack,
	StatusDot,
	TypewriterText,
	usePulse,
	// Hooks
	useRingInput,
	VerticalRing,
} from "../index.js";

// ─────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────

const MAIN_MENU: RingItem[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: "◈",
		description: "System overview and status",
	},
	{
		id: "files",
		label: "Files",
		icon: "▤",
		description: "Browse and manage files",
	},
	{
		id: "settings",
		label: "Settings",
		icon: "⚙",
		description: "Configure system preferences",
	},
	{
		id: "network",
		label: "Network",
		icon: "◎",
		description: "Network connections and status",
	},
	{
		id: "terminal",
		label: "Terminal",
		icon: ">_",
		description: "Command line interface",
	},
	{
		id: "apps",
		label: "Applications",
		icon: "⊞",
		description: "Installed applications",
	},
	{
		id: "about",
		label: "About",
		icon: "ⓘ",
		description: "System information",
	},
];

const SAMPLE_SPARKLINE = [
	12, 18, 14, 22, 19, 25, 23, 28, 31, 26, 29, 35, 32, 38, 41, 37, 44, 42, 48,
	45,
];

// ─────────────────────────────────────────────────────────────
// View Components
// ─────────────────────────────────────────────────────────────

interface ViewProps {
	onBack: () => void;
}

/**
 * Dashboard View - System overview
 */
function DashboardView({ onBack }: ViewProps) {
	const cpuUsage = usePulse(35, 65, 3000);
	const memUsage = usePulse(50, 70, 4000);

	useRingInput({ onEscape: onBack });

	return (
		<Screen
			title="Dashboard"
			footer={<Footer hints={[{ key: "Esc", label: "back" }]} />}
		>
			<Grid columns={2} gap={2}>
				{/* CPU Card */}
				<Card title="CPU" width={35}>
					<Stack gap={1}>
						<Row justify="between">
							<Text color={PALETTE.dim}>Usage</Text>
							<Text color={PALETTE.accent}>{Math.round(cpuUsage)}%</Text>
						</Row>
						<Progress value={cpuUsage} width={28} animated />
					</Stack>
				</Card>

				{/* Memory Card */}
				<Card title="Memory" width={35}>
					<Stack gap={1}>
						<Row justify="between">
							<Text color={PALETTE.dim}>Used</Text>
							<Text color={PALETTE.accent}>{Math.round(memUsage)}%</Text>
						</Row>
						<Progress
							value={memUsage}
							width={28}
							color={PALETTE.warning}
							animated
						/>
					</Stack>
				</Card>

				{/* Network Card */}
				<Card title="Network" width={35}>
					<Stack gap={1}>
						<Row>
							<StatusDot status="success" />
							<Text color={PALETTE.dim}> Connected</Text>
						</Row>
						<Sparkline values={SAMPLE_SPARKLINE} width={28} />
					</Stack>
				</Card>

				{/* Activity Card */}
				<Card title="Activity" width={35}>
					<Stack gap={1}>
						<Row>
							<Spinner type="dots" />
							<Text color={PALETTE.dim}> 3 tasks running</Text>
						</Row>
						<LoadingBar width={28} />
					</Stack>
				</Card>
			</Grid>

			{/* Status line */}
			<Box marginTop={1}>
				<Text color={PALETTE.dim}>
					Last updated: <Text color={PALETTE.fg}>just now</Text>
				</Text>
			</Box>
		</Screen>
	);
}

/**
 * Settings View - Configuration options
 */
function SettingsView({ onBack }: ViewProps) {
	const settingsItems: RingItem[] = [
		{ id: "display", label: "Display", icon: "▣" },
		{ id: "sound", label: "Sound", icon: "♪" },
		{ id: "input", label: "Input", icon: "⌨" },
		{ id: "power", label: "Power", icon: "⏻" },
		{ id: "security", label: "Security", icon: "🔒" },
		{ id: "updates", label: "Updates", icon: "↻" },
	];

	const [selected, setSelected] = useState<string | null>(null);

	return (
		<Screen
			title="Settings"
			footer={
				<Footer
					hints={[
						{ key: "←→", label: "navigate" },
						{ key: "↵", label: "select" },
						{ key: "Esc", label: "back" },
					]}
				/>
			}
		>
			<Split ratio={0.5}>
				<Box paddingRight={2}>
					<VerticalRing
						items={settingsItems}
						onSelect={(item) => setSelected(item.id)}
						width={30}
					/>
				</Box>

				<Card
					title={selected ?? "Select option"}
					width={40}
					active={!!selected}
				>
					{selected ? (
						<Stack gap={1}>
							<Text color={PALETTE.dim}>Configure {selected} settings</Text>
							<Divider width={34} />
							<Row>
								<Text color={PALETTE.dim}>Status:</Text>
								<StatusDot status="success" />
								<Text color={PALETTE.success}> Enabled</Text>
							</Row>
						</Stack>
					) : (
						<Text color={PALETTE.dim}>
							Use ←→ to navigate and press Enter to select
						</Text>
					)}
				</Card>
			</Split>
		</Screen>
	);
}

/**
 * About View - System information with ASCII art
 */
function AboutView({ onBack }: ViewProps) {
	useRingInput({ onEscape: onBack });

	return (
		<Screen
			title="About Ring World"
			footer={<Footer hints={[{ key: "Esc", label: "back" }]} />}
		>
			<Center>
				<Stack gap={1} align="center">
					<ASCIIArt art="logo" color={PALETTE.accent} />

					<Box marginTop={1}>
						<TypewriterText
							text="TUI Framework for Tiny Displays"
							charDelay={40}
							color={PALETTE.fg}
						/>
					</Box>

					<Divider width={30} label="v0.1.0" color={PALETTE.frame} />

					<Stack gap={0} align="center">
						<Text color={PALETTE.dim}>Optimized for 640×350</Text>
						<Text color={PALETTE.dim}>Proggy Clean Tiny Font</Text>
					</Stack>

					<Box marginTop={1}>
						<Row gap={2}>
							<Badge color={PALETTE.accent}>Ink</Badge>
							<Badge color={PALETTE.success}>React</Badge>
							<Badge color={PALETTE.warning}>Bun</Badge>
						</Row>
					</Box>

					<Box marginTop={1}>
						<ASCIIArt art="wave" color={PALETTE.dim} animated />
					</Box>
				</Stack>
			</Center>
		</Screen>
	);
}

/**
 * Components View - Widget showcase
 */
function ComponentsView({ onBack }: ViewProps) {
	useRingInput({ onEscape: onBack });
	const [progress, setProgress] = useState(0);

	// Animate progress
	React.useEffect(() => {
		const interval = setInterval(() => {
			setProgress((p) => (p + 1) % 101);
		}, 50);
		return () => clearInterval(interval);
	}, []);

	return (
		<Screen
			title="Components"
			footer={<Footer hints={[{ key: "Esc", label: "back" }]} />}
		>
			<Grid columns={2} gap={2}>
				{/* Spinners */}
				<Card title="Spinners" width={35}>
					<Row gap={3}>
						<Spinner type="dots" label="dots" />
					</Row>
					<Row gap={3}>
						<Spinner type="arc" label="arc" />
					</Row>
					<Row gap={3}>
						<Spinner type="pulse" label="pulse" />
					</Row>
				</Card>

				{/* Progress */}
				<Card title="Progress" width={35}>
					<Stack gap={1}>
						<Progress value={progress} width={28} showValue />
						<LoadingBar width={28} />
					</Stack>
				</Card>

				{/* Gauges */}
				<Card title="Gauges" width={35}>
					<Row gap={3}>
						<Gauge value={25} size="sm" />
						<Gauge value={50} size="sm" />
						<Gauge value={75} size="sm" />
						<Gauge value={100} size="sm" />
					</Row>
				</Card>

				{/* Text Effects */}
				<Card title="Text Effects" width={35}>
					<Stack gap={1}>
						<Blink rate="slow">
							<Text color={PALETTE.warning}>● Alert</Text>
						</Blink>
						<Marquee text="Scrolling notification message..." width={28} />
					</Stack>
				</Card>
			</Grid>
		</Screen>
	);
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────

type AppView = "main" | "dashboard" | "settings" | "about" | "components";

function App() {
	const [view, setView] = useState<AppView>("main");

	const handleSelect = useCallback((item: RingItem) => {
		switch (item.id) {
			case "dashboard":
				setView("dashboard");
				break;
			case "settings":
				setView("settings");
				break;
			case "about":
				setView("about");
				break;
			case "apps":
				setView("components");
				break;
		}
	}, []);

	const goBack = useCallback(() => setView("main"), []);

	// Render current view
	if (view === "dashboard") {
		return <DashboardView onBack={goBack} />;
	}

	if (view === "settings") {
		return <SettingsView onBack={goBack} />;
	}

	if (view === "about") {
		return <AboutView onBack={goBack} />;
	}

	if (view === "components") {
		return <ComponentsView onBack={goBack} />;
	}

	// Main menu with Ring navigation
	return (
		<Screen
			statusBar={
				<Row justify="between">
					<Row>
						<StatusDot status="success" />
						<Text color={PALETTE.dim}> System OK</Text>
					</Row>
					<Text color={PALETTE.dim}>12:34</Text>
				</Row>
			}
			footer={
				<Footer
					hints={[
						{ key: "←→", label: "navigate" },
						{ key: "↵", label: "select" },
						{ key: "q", label: "quit" },
					]}
				/>
			}
		>
			<Center>
				<Stack gap={2} align="center">
					{/* Logo */}
					<ASCIIArt art="ring" color={PALETTE.accent} />

					{/* Main Ring Navigation */}
					<Ring
						items={MAIN_MENU}
						onSelect={handleSelect}
						visibleItems={5}
						width={50}
						showDescription={true}
					/>
				</Stack>
			</Center>
		</Screen>
	);
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────

render(<App />);
