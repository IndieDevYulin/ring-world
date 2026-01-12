/**
 * Ring World
 *
 * A TUI library for tiny displays (640x350px) with 3D ring navigation.
 * Built on Ink, optimized for Proggy Clean Tiny font.
 *
 * @example
 * ```tsx
 * import { Ring, Screen, Frame } from 'ring-world';
 *
 * function App() {
 *   return (
 *     <Screen title="My App">
 *       <Ring
 *         items={[
 *           { id: '1', label: 'Settings', icon: '⚙' },
 *           { id: '2', label: 'Files', icon: '📁' },
 *           { id: '3', label: 'Network', icon: '🌐' },
 *         ]}
 *         onSelect={(item) => console.log(item)}
 *       />
 *     </Screen>
 *   );
 * }
 * ```
 */

// Re-export common Ink components for convenience
export { Box, render, Text, useApp, useInput, useStdin } from "ink";
// Components
export * from "./components/index.js";
// Hooks
export * from "./hooks/index.js";
// Theme
export * from "./themes/index.js";
