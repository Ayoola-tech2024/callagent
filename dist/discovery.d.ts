import { DiscoveredAgent } from './types.js';
/**
 * Searches the system PATH for a binary name.
 * On Windows, handles .cmd / .exe / .bat priority.
 */
export declare function findExecutable(binaryName: string): string | null;
/**
 * Discovers all supported agents present on the system.
 */
export declare function discoverAgents(): DiscoveredAgent[];
/**
 * Returns only the currently available/installed agents.
 */
export declare function getAvailableAgents(): DiscoveredAgent[];
