#!/usr/bin/env bun

/**
 * Ring World - File Browser Example
 *
 * Demonstrates nested ring navigation for browsing hierarchical data.
 * The 3D ring metaphor works naturally for folder/file structures.
 */

import { Box, render, Text } from "ink";
import React, { useCallback, useMemo, useState } from "react";

import {
	Badge,
	Card,
	CHARS,
	Divider,
	Footer,
	Header,
	PALETTE,
	Ring,
	type RingItem,
	Row,
	Screen,
	Split,
	Stack,
	usePulse,
} from "../index.js";

// ─────────────────────────────────────────────────────────────
// File System Types & Data
// ─────────────────────────────────────────────────────────────

interface FileNode {
	id: string;
	name: string;
	type: "folder" | "file";
	size?: number;
	modified?: string;
	children?: FileNode[];
}

const FILE_ICONS = {
	folder: "▤",
	folderOpen: "▥",
	file: "▪",
	image: "▣",
	code: "◇",
	text: "▫",
	audio: "♪",
	video: "▶",
};

const MOCK_FS: FileNode = {
	id: "root",
	name: "/",
	type: "folder",
	children: [
		{
			id: "home",
			name: "home",
			type: "folder",
			children: [
				{
					id: "documents",
					name: "documents",
					type: "folder",
					children: [
						{ id: "notes.txt", name: "notes.txt", type: "file", size: 2048 },
						{ id: "todo.md", name: "todo.md", type: "file", size: 512 },
						{
							id: "report.pdf",
							name: "report.pdf",
							type: "file",
							size: 102400,
						},
					],
				},
				{
					id: "pictures",
					name: "pictures",
					type: "folder",
					children: [
						{
							id: "photo1.jpg",
							name: "photo1.jpg",
							type: "file",
							size: 2048000,
						},
						{
							id: "photo2.jpg",
							name: "photo2.jpg",
							type: "file",
							size: 1843200,
						},
						{
							id: "screenshot.png",
							name: "screenshot.png",
							type: "file",
							size: 524288,
						},
					],
				},
				{
					id: "music",
					name: "music",
					type: "folder",
					children: [
						{
							id: "track1.mp3",
							name: "track1.mp3",
							type: "file",
							size: 5242880,
						},
						{
							id: "track2.mp3",
							name: "track2.mp3",
							type: "file",
							size: 4194304,
						},
					],
				},
				{ id: ".config", name: ".config", type: "folder", children: [] },
			],
		},
		{
			id: "var",
			name: "var",
			type: "folder",
			children: [
				{ id: "log", name: "log", type: "folder", children: [] },
				{ id: "cache", name: "cache", type: "folder", children: [] },
			],
		},
		{
			id: "etc",
			name: "etc",
			type: "folder",
			children: [
				{ id: "hosts", name: "hosts", type: "file", size: 256 },
				{ id: "passwd", name: "passwd", type: "file", size: 1024 },
			],
		},
	],
};

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function formatSize(bytes?: number): string {
	if (bytes === undefined) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(node: FileNode): string {
	if (node.type === "folder") return FILE_ICONS.folder;

	const ext = node.name.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "jpg":
		case "png":
		case "gif":
			return FILE_ICONS.image;
		case "js":
		case "ts":
		case "tsx":
		case "py":
			return FILE_ICONS.code;
		case "txt":
		case "md":
			return FILE_ICONS.text;
		case "mp3":
		case "wav":
			return FILE_ICONS.audio;
		case "mp4":
		case "mov":
			return FILE_ICONS.video;
		default:
			return FILE_ICONS.file;
	}
}

function nodeToRingItem(node: FileNode): RingItem {
	return {
		id: node.id,
		label: node.name,
		icon: getFileIcon(node),
		description:
			node.type === "folder"
				? `${node.children?.length ?? 0} items`
				: formatSize(node.size),
	};
}

function findNode(root: FileNode, path: string[]): FileNode | null {
	if (path.length === 0) return root;

	const [next, ...rest] = path;
	const child = root.children?.find((c) => c.id === next);
	if (!child) return null;

	return rest.length === 0 ? child : findNode(child, rest);
}

// ─────────────────────────────────────────────────────────────
// File Preview Component
// ─────────────────────────────────────────────────────────────

interface FilePreviewProps {
	node: FileNode | null;
}

function FilePreview({ node }: FilePreviewProps) {
	const _pulse = usePulse(0.3, 0.7, 2000);

	if (!node) {
		return (
			<Card title="Preview" width={40}>
				<Text color={PALETTE.dim}>Select a file to preview</Text>
			</Card>
		);
	}

	if (node.type === "folder") {
		const itemCount = node.children?.length ?? 0;
		const folderCount =
			node.children?.filter((c) => c.type === "folder").length ?? 0;
		const fileCount = itemCount - folderCount;

		return (
			<Card title={node.name} width={40} style="rounded" active>
				<Stack gap={1}>
					<Row>
						<Text color={PALETTE.accent} bold>
							{FILE_ICONS.folderOpen}
						</Text>
						<Text color={PALETTE.fg}> Folder</Text>
					</Row>

					<Divider width={34} />

					<Row justify="between">
						<Text color={PALETTE.dim}>Folders:</Text>
						<Text color={PALETTE.fg}>{folderCount}</Text>
					</Row>
					<Row justify="between">
						<Text color={PALETTE.dim}>Files:</Text>
						<Text color={PALETTE.fg}>{fileCount}</Text>
					</Row>

					<Divider width={34} />

					<Text color={PALETTE.dim}>
						Press <Text color={PALETTE.accent}>↵</Text> to open
					</Text>
				</Stack>
			</Card>
		);
	}

	// File preview
	const ext = node.name.split(".").pop()?.toLowerCase();
	const isImage = ["jpg", "png", "gif"].includes(ext ?? "");
	const isCode = ["js", "ts", "tsx", "py", "rs"].includes(ext ?? "");
	const isText = ["txt", "md"].includes(ext ?? "");

	return (
		<Card title={node.name} width={40} style="rounded" active>
			<Stack gap={1}>
				<Row>
					<Text color={PALETTE.accent} bold>
						{getFileIcon(node)}
					</Text>
					<Text color={PALETTE.fg}> {ext?.toUpperCase() ?? "File"}</Text>
				</Row>

				<Divider width={34} />

				<Row justify="between">
					<Text color={PALETTE.dim}>Size:</Text>
					<Text color={PALETTE.fg}>{formatSize(node.size)}</Text>
				</Row>

				{/* Mock file content preview */}
				{isText && (
					<>
						<Divider width={34} label="Content" />
						<Text color={PALETTE.dim}>Lorem ipsum dolor sit amet...</Text>
					</>
				)}

				{isCode && (
					<>
						<Divider width={34} label="Code" />
						<Text color={PALETTE.accent}>
							<Text color={PALETTE.warning}>const</Text> x = 42;
						</Text>
					</>
				)}

				{isImage && (
					<>
						<Divider width={34} label="Preview" />
						<Box>
							<Text color={PALETTE.dim}>
								{"┌──────────────────┐\n"}
								{"│  ◇ Image        │\n"}
								{"│    Preview      │\n"}
								{"└──────────────────┘"}
							</Text>
						</Box>
					</>
				)}
			</Stack>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────
// Breadcrumb Component
// ─────────────────────────────────────────────────────────────

interface BreadcrumbProps {
	path: string[];
	root: FileNode;
}

function Breadcrumb({ path, root }: BreadcrumbProps) {
	const parts = [
		"/",
		...path.map((id) => {
			const node = findNode(root, path.slice(0, path.indexOf(id) + 1));
			return node?.name ?? id;
		}),
	];

	return (
		<Row>
			{parts.map((part, partIdx) => (
				<React.Fragment key={`part-${partIdx}`}>
					{partIdx > 0 && (
						<Text color={PALETTE.frame}> {CHARS.nav.arrow} </Text>
					)}
					<Text color={partIdx === parts.length - 1 ? PALETTE.fg : PALETTE.dim}>
						{part}
					</Text>
				</React.Fragment>
			))}
		</Row>
	);
}

// ─────────────────────────────────────────────────────────────
// Main File Browser
// ─────────────────────────────────────────────────────────────

function FileBrowser() {
	const [path, setPath] = useState<string[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	// Get current directory
	const currentDir = useMemo(() => {
		const node = path.length === 0 ? MOCK_FS : findNode(MOCK_FS, path);
		return node?.type === "folder" ? node : null;
	}, [path]);

	// Convert children to ring items
	const items = useMemo(() => {
		if (!currentDir?.children) return [];
		return currentDir.children.map(nodeToRingItem);
	}, [currentDir]);

	// Get selected node for preview
	const selectedNode = useMemo(() => {
		if (!selectedId || !currentDir?.children) return null;
		return currentDir.children.find((c) => c.id === selectedId) ?? null;
	}, [selectedId, currentDir]);

	// Handle navigation
	const handleSelect = useCallback(
		(item: RingItem) => {
			const node = currentDir?.children?.find((c) => c.id === item.id);
			if (!node) return;

			if (node.type === "folder" && node.children && node.children.length > 0) {
				setPath((p) => [...p, node.id]);
				setSelectedId(null);
			} else {
				setSelectedId(node.id);
			}
		},
		[currentDir],
	);

	const handleBack = useCallback(() => {
		if (path.length > 0) {
			setPath((p) => p.slice(0, -1));
			setSelectedId(null);
		}
	}, [path]);

	// Track ring selection for preview
	const _handleRingChange = useCallback((item: RingItem, _index: number) => {
		setSelectedId(item.id);
	}, []);

	if (!currentDir) {
		return (
			<Screen title="Error">
				<Text color={PALETTE.danger}>Directory not found</Text>
			</Screen>
		);
	}

	return (
		<Screen
			statusBar={
				<Row justify="between">
					<Breadcrumb path={path} root={MOCK_FS} />
					<Badge>{`${items.length} items`}</Badge>
				</Row>
			}
			footer={
				<Footer
					hints={[
						{ key: "←→", label: "navigate" },
						{ key: "↵", label: "open" },
						{ key: "Esc", label: path.length > 0 ? "back" : "quit" },
					]}
				/>
			}
		>
			<Split ratio={0.55} gap={2}>
				{/* File Ring */}
				<Box flexDirection="column">
					<Header
						title={currentDir.name === "/" ? "Root" : currentDir.name}
						style="underline"
					/>

					{items.length > 0 ? (
						<Ring
							items={items}
							onSelect={handleSelect}
							onBack={handleBack}
							visibleItems={7}
							width={45}
							showDescription={false}
							showIndicators={true}
						/>
					) : (
						<Box paddingY={2}>
							<Text color={PALETTE.dim}>Empty folder</Text>
						</Box>
					)}
				</Box>

				{/* Preview Panel */}
				<FilePreview node={selectedNode} />
			</Split>
		</Screen>
	);
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────

render(<FileBrowser />);
