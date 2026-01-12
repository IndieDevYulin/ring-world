import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Ring World - Display Emulator",
	description: "Web-based emulator for Ring World TUI library",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body style={{ margin: 0, padding: 0 }}>{children}</body>
		</html>
	);
}
