"use client";

import { useCallback, useEffect, useState } from "react";

interface RingItem {
	id: string;
	label: string;
	icon?: string;
	color?: string;
	description?: string;
}

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
		description: "Configure preferences",
	},
	{
		id: "network",
		label: "Network",
		icon: "◎",
		description: "Connections and status",
	},
	{
		id: "media",
		label: "Media",
		icon: "♫",
		description: "Music and video player",
	},
	{
		id: "terminal",
		label: "Terminal",
		icon: ">_",
		description: "Command interface",
	},
	{ id: "about", label: "About", icon: "ⓘ", description: "System information" },
];

const COLORS = {
	bg: "#1d1f21",
	fg: "#c5c8c6",
	dim: "#5c5e5f",
	accent: "#81a2be",
	highlight: "#f0c674",
	success: "#8c9440",
	warning: "#de935f",
	danger: "#a54242",
	frame: "#5c5e5f",
};

const CHARS = {
	light: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
	ring: { dot: "●", ring: "○", selected: "◎", arrow: "▶" },
	deco: { diamond: "◆" },
};

function Ring({
	items,
	selectedIndex = 0,
	visibleItems = 5,
	width = 50,
	_onSelect,
}: {
	items: RingItem[];
	selectedIndex?: number;
	visibleItems?: number;
	width?: number;
	onSelect?: (item: RingItem) => void;
}) {
	const halfVisible = Math.floor(visibleItems / 2);
	const depthColors = [COLORS.fg, COLORS.dim, COLORS.dim];

	return (
		<div
			style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.2" }}
		>
			<div style={{ color: COLORS.dim }}>
				{"  "}
				{CHARS.deco.diamond} Ring World Demo
			</div>
			<div style={{ color: COLORS.dim }}>
				{CHARS.ring.left} prev
				{"                                            "}
				next {CHARS.ring.right}
			</div>

			{Array.from({ length: visibleItems }).map((_, i) => {
				const depth = Math.abs(i - halfVisible);
				const itemIndex =
					(((selectedIndex + i - halfVisible) % items.length) + items.length) %
					items.length;
				const item = items[itemIndex];
				const isSelected = depth === 0;

				const color = item.color || depthColors[Math.min(depth, 2)];
				const padding = " ".repeat(depth * 2 + 1);

				const icon = item.icon || CHARS.ring.dot;
				const selector = isSelected
					? CHARS.ring.selected
					: depth === 1
						? CHARS.ring.ring
						: " ";

				let label = item.label;
				if (label.length > width - depth * 4 - 4) {
					label = `${label.slice(0, width - depth * 4 - 5)}…`;
				}

				return (
					<div
						key={item.id}
						style={{
							paddingLeft: padding.length * 4 + 4,
							color: isSelected ? color : COLORS.dim,
							fontWeight: isSelected ? "bold" : "normal",
							opacity: isSelected ? 1 : 0.7,
						}}
					>
						{selector} {icon} {label}
					</div>
				);
			})}

			<div style={{ color: COLORS.dim, marginTop: "4px", textAlign: "center" }}>
				{items.slice(0, Math.min(items.length, 9)).map((_, i) => (
					<span
						key={i}
						style={{
							color:
								i === selectedIndex % items.length ? COLORS.accent : COLORS.dim,
						}}
					>
						{i === selectedIndex % items.length
							? CHARS.ring.dot
							: CHARS.ring.ring}
					</span>
				))}
			</div>

			{items[selectedIndex]?.description && (
				<div
					style={{ color: COLORS.dim, marginTop: "4px", paddingLeft: "16px" }}
				>
					{items[selectedIndex].description}
				</div>
			)}

			<div style={{ color: COLORS.dim, marginTop: "8px", textAlign: "center" }}>
				<span style={{ color: COLORS.accent }}>↵</span> select{"    "}
				<span style={{ color: COLORS.accent }}>⎋</span> back
			</div>
		</div>
	);
}

function Frame({
	width = 40,
	title,
	children,
	active = false,
}: {
	width?: number;
	title?: string;
	children: React.ReactNode;
	active?: boolean;
}) {
	const chars = CHARS.light;
	const color = active ? COLORS.accent : COLORS.frame;
	const innerWidth = width - 2;

	let titleBar = "";
	if (title && innerWidth > 4) {
		const displayTitle =
			title.length > innerWidth - 4
				? `${title.slice(0, innerWidth - 5)}…`
				: title;
		const titleWithBrackets = `┤ ${displayTitle} ├`;
		const remainingWidth = innerWidth - titleWithBrackets.length + 2;
		const leftPad = Math.floor(remainingWidth / 2);
		titleBar =
			chars.h.repeat(leftPad) +
			titleWithBrackets +
			chars.h.repeat(remainingWidth - leftPad);
	}

	const topBorder = titleBar
		? chars.tl + titleBar + chars.tr
		: chars.tl + chars.h.repeat(innerWidth) + chars.tr;
	const bottomBorder = chars.bl + chars.h.repeat(innerWidth) + chars.br;

	return (
		<div
			style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.2" }}
		>
			<div style={{ color: color }}>{topBorder}</div>
			<div style={{ color: color }}>
				{chars.v}
				{children}
				{" ".repeat(innerWidth - String(children).length)}
				{chars.v}
			</div>
			<div style={{ color: color }}>{bottomBorder}</div>
		</div>
	);
}

function Progress({
	value = 50,
	width = 20,
	color = COLORS.accent,
}: {
	value?: number;
	width?: number;
	color?: string;
}) {
	const fillWidth = Math.round((value / 100) * width);
	const emptyWidth = width - fillWidth;
	return (
		<span>
			<span style={{ color }}>{"█".repeat(fillWidth)}</span>
			<span style={{ color: COLORS.frame }}>{"░".repeat(emptyWidth)}</span>
		</span>
	);
}

function Spinner({ frame = 0 }: { frame?: number }) {
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	const currentFrame = frames[Math.floor(frame / 4) % 10];
	return <span style={{ color: COLORS.accent }}>{currentFrame}</span>;
}

function StatusDot({ status, pulse }: { status: string; pulse?: boolean }) {
	const colors: Record<string, string> = {
		success: COLORS.success,
		warning: COLORS.warning,
		danger: COLORS.danger,
		info: COLORS.accent,
	};
	return (
		<span style={{ color: colors[status] }}>
			{pulse ? CHARS.ring.ring : CHARS.ring.dot}
		</span>
	);
}

function Footer({ hints }: { hints: Array<{ key: string; label: string }> }) {
	return hints
		.map((h) => (
			<span key={h.key}>
				<span style={{ color: COLORS.accent }}>{h.key}</span> {h.label}
			</span>
		))
		.reduce(
			(prev: React.ReactNode, curr, i) =>
				(i > 0 ? [prev, "   ", curr] : [curr]) as React.ReactNode[],
		);
}

type View = "main" | "dashboard" | "settings" | "about" | "media";

export default function RingWorldDemo() {
	const [view, setView] = useState<View>("main");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [spinnerFrame, setSpinnerFrame] = useState(0);
	const [cpuValue, setCpuValue] = useState(45);
	const [memValue, setMemValue] = useState(62);
	const [mediaProgress, setMediaProgress] = useState(0.35);
	const [mediaPlaying, _setMediaPlaying] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setSpinnerFrame((f) => f + 1);
			setCpuValue(45 + Math.sin(Date.now() / 1000) * 15);
			setMemValue(52 + Math.cos(Date.now() / 1200) * 12);
			if (mediaPlaying) {
				setMediaProgress((p) => (p + 0.001) % 1);
			}
		}, 50);
		return () => clearInterval(interval);
	}, [mediaPlaying]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
				case "h":
					setSelectedIndex(
						(i) => (i - 1 + MAIN_MENU.length) % MAIN_MENU.length,
					);
					break;
				case "ArrowRight":
				case "l":
					setSelectedIndex((i) => (i + 1) % MAIN_MENU.length);
					break;
				case "Enter": {
					const item = MAIN_MENU[selectedIndex];
					if (item.id === "dashboard") setView("dashboard");
					else if (item.id === "settings") setView("settings");
					else if (item.id === "about") setView("about");
					else if (item.id === "media") setView("media");
					break;
				}
				case "Escape":
				case "q":
					setView("main");
					setSelectedIndex(0);
					break;
			}
		},
		[selectedIndex],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const renderMainView = () => (
		<div
			style={{
				padding: "8px 12px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
			}}
		>
			<div
				style={{
					border: `1px solid ${COLORS.frame}`,
					borderRadius: "4px",
					padding: "4px",
				}}
			>
				<div style={{ color: COLORS.frame, marginBottom: "4px" }}>
					{`┌${"─".repeat(61)}┐`}
				</div>
				<Ring
					items={MAIN_MENU}
					selectedIndex={selectedIndex}
					onSelect={(item) => {
						if (item.id === "dashboard") setView("dashboard");
						else if (item.id === "settings") setView("settings");
						else if (item.id === "about") setView("about");
						else if (item.id === "media") setView("media");
					}}
				/>
				<div style={{ color: COLORS.frame }}>{`└${"─".repeat(61)}┘`}</div>
			</div>
		</div>
	);

	const renderDashboardView = () => (
		<div style={{ padding: "8px 12px" }}>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "8px",
					marginBottom: "8px",
				}}
			>
				<Frame width={40} style="rounded" title="CPU">
					{`Usage    ${Progress({ value: cpuValue, width: 25 })}  ${Math.round(cpuValue)}%`}
				</Frame>
				<Frame width={40} style="rounded" title="Memory">
					{`Used     ${Progress({ value: memValue, width: 25, color: COLORS.warning })}  ${Math.round(memValue)}%`}
				</Frame>
				<Frame width={40} style="rounded" title="Network">
					{`${StatusDot({ status: "success", pulse: true })} Connected`}
				</Frame>
				<Frame width={40} style="rounded" title="Activity">
					{`${Spinner({ frame: spinnerFrame })} 3 tasks running`}
				</Frame>
			</div>
			<div style={{ color: COLORS.dim, fontSize: "11px", marginTop: "8px" }}>
				Last updated: <span style={{ color: COLORS.fg }}>just now</span>
			</div>
			<div style={{ color: COLORS.dim, fontSize: "11px", marginTop: "4px" }}>
				<Footer hints={[{ key: "Esc", label: "back" }]} />
			</div>
		</div>
	);

	const renderSettingsView = () => {
		const settings = [
			{ id: "display", label: "Display" },
			{ id: "sound", label: "Sound" },
			{ id: "input", label: "Input" },
			{ id: "power", label: "Power" },
			{ id: "security", label: "Security" },
			{ id: "updates", label: "Updates" },
		];

		return (
			<div style={{ padding: "8px 12px" }}>
				<div style={{ display: "flex", gap: "8px" }}>
					<Frame width={28} style="light" title="Settings">
						{settings
							.map((item, i) => (
								<div
									key={item.id}
									style={{
										color: i === selectedIndex ? COLORS.accent : COLORS.dim,
									}}
								>
									{(i === selectedIndex ? CHARS.ring.arrow : " ") +
										" " +
										item.label}
								</div>
							))
							.join("\n")}
					</Frame>
					<Frame
						width={45}
						style="rounded"
						active={selectedIndex >= 0}
						title={settings[selectedIndex]?.label || "Select option"}
					>
						{selectedIndex >= 0
							? `Configure ${settings[selectedIndex].label} settings\n\n${"─".repeat(30)}\nStatus: ${StatusDot({ status: "success" })} Enabled`
							: "Use ←→ to navigate and press Enter to select"}
					</Frame>
				</div>
				<div style={{ color: COLORS.dim, fontSize: "11px", marginTop: "4px" }}>
					<Footer
						hints={[
							{ key: "←→", label: "navigate" },
							{ key: "↵", label: "select" },
							{ key: "Esc", label: "back" },
						]}
					/>
				</div>
			</div>
		);
	};

	const renderAboutView = () => (
		<div
			style={{
				padding: "8px 12px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
			}}
		>
			<div
				style={{
					fontFamily: "monospace",
					fontSize: "13px",
					color: COLORS.accent,
					whiteSpace: "pre",
				}}
			>
				{`┌─────────────────┐
│  R I N G        │
│      W O R L D  │
└─────────────────┘`}
			</div>
			<div
				style={{
					color: COLORS.fg,
					marginTop: "8px",
					fontSize: "13px",
					fontFamily: "monospace",
				}}
			>
				TUI Framework for Tiny Displays
			</div>
			<div
				style={{
					color: COLORS.frame,
					marginTop: "4px",
					fontSize: "11px",
					fontFamily: "monospace",
				}}
			>
				{"─".repeat(25)}
			</div>
			<div
				style={{
					color: COLORS.dim,
					marginTop: "4px",
					fontSize: "11px",
					fontFamily: "monospace",
					textAlign: "center",
				}}
			>
				Optimized for 640×350
			</div>
		</div>
	);

	const renderMediaView = () => {
		const mediaItems = [
			{
				id: "1",
				label: "Midnight Drive",
				icon: "♪",
				description: "Neon Pulse - City Lights",
				color: COLORS.accent,
			},
			{
				id: "2",
				label: "Digital Dreams",
				icon: "♪",
				description: "Synthwave Collective",
				color: COLORS.highlight,
			},
			{
				id: "3",
				label: "Chrome Hearts",
				icon: "♪",
				description: "Electric Horizon",
				color: COLORS.success,
			},
			{
				id: "4",
				label: "Neon Skyline",
				icon: "♪",
				description: "Neon Pulse",
				color: COLORS.warning,
			},
			{
				id: "5",
				label: "Binary Sunset",
				icon: "♪",
				description: "Data Stream",
				color: COLORS.danger,
			},
		];

		return (
			<div style={{ padding: "8px 12px" }}>
				<Frame
					width={65}
					style="rounded"
					title="Now Playing"
					active={mediaPlaying}
				>
					{`${mediaItems[selectedIndex].label}\n${mediaItems[selectedIndex].description}\n${"─".repeat(60)}\n\n${Progress({ value: mediaProgress * 100, width: 45, color: mediaItems[selectedIndex].color })}  ${Math.round(mediaProgress * 100)}%`}
				</Frame>
				<div style={{ marginTop: "8px" }}>
					<Ring items={mediaItems} selectedIndex={selectedIndex} width={65} />
				</div>
				<div style={{ color: COLORS.dim, fontSize: "11px", marginTop: "4px" }}>
					<Footer
						hints={[
							{ key: "←→", label: "track" },
							{ key: "Space", label: "play/pause" },
							{ key: "Esc", label: "back" },
						]}
					/>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		switch (view) {
			case "main":
				return renderMainView();
			case "dashboard":
				return renderDashboardView();
			case "settings":
				return renderSettingsView();
			case "about":
				return renderAboutView();
			case "media":
				return renderMediaView();
			default:
				return renderMainView();
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				background:
					"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
				padding: "20px",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h1
				style={{
					color: COLORS.accent,
					textAlign: "center",
					marginBottom: "10px",
					fontWeight: "300",
					letterSpacing: "2px",
				}}
			>
				RING WORLD
			</h1>
			<p
				style={{
					color: COLORS.dim,
					textAlign: "center",
					marginBottom: "30px",
					fontSize: "14px",
				}}
			>
				TUI Display Emulator - 640×350@2x
			</p>

			<div style={{ display: "flex", justifyContent: "center" }}>
				<div
					style={{
						background: "#0a0a0a",
						padding: "20px",
						borderRadius: "12px",
						boxShadow: `
            0 0 0 3px #2d2d2d,
            0 0 0 6px #1a1a1a,
            0 20px 50px rgba(0, 0, 0, 0.5)
          `,
					}}
				>
					<div
						style={{
							background:
								"linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0d0d0d 100%)",
							padding: "8px",
							borderRadius: "8px",
						}}
					>
						<div
							style={{
								background: COLORS.bg,
								width: "640px",
								height: "350px",
								borderRadius: "4px",
								boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.5)",
								overflow: "hidden",
							}}
						>
							{renderContent()}
						</div>
					</div>
					<div
						style={{
							position: "absolute",
							bottom: "8px",
							right: "15px",
							width: "8px",
							height: "8px",
							background: COLORS.success,
							borderRadius: "50%",
							boxShadow: `0 0 10px ${COLORS.success}`,
						}}
					/>
				</div>
			</div>

			<div
				style={{
					marginTop: "30px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "15px",
				}}
			>
				<div
					style={{
						display: "flex",
						gap: "20px",
						flexWrap: "wrap",
						justifyContent: "center",
						color: COLORS.dim,
						fontSize: "13px",
					}}
				>
					<span>
						<span
							style={{
								background: "#2d2d2d",
								padding: "5px 10px",
								borderRadius: "4px",
								border: "1px solid #3d3d3d",
								marginRight: "8px",
								fontFamily: "monospace",
							}}
						>
							←→
						</span>{" "}
						Navigate
					</span>
					<span>
						<span
							style={{
								background: "#2d2d2d",
								padding: "5px 10px",
								borderRadius: "4px",
								border: "1px solid #3d3d3d",
								marginRight: "8px",
								fontFamily: "monospace",
							}}
						>
							↵
						</span>{" "}
						Select
					</span>
					<span>
						<span
							style={{
								background: "#2d2d2d",
								padding: "5px 10px",
								borderRadius: "4px",
								border: "1px solid #3d3d3d",
								marginRight: "8px",
								fontFamily: "monospace",
							}}
						>
							Esc
						</span>{" "}
						Back
					</span>
				</div>
			</div>
		</div>
	);
}
