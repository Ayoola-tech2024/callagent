import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { SUPPORTED_AGENTS, DiscoveredAgent } from './types.js';

const isWindows = os.platform() === 'win32';

/**
 * Searches the system PATH for a binary name.
 * On Windows, handles .cmd / .exe / .bat priority.
 */
export function findExecutable(binaryName: string): string | null {
  try {
    if (isWindows) {
      const output = execFileSync('where.exe', [binaryName], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      const lines = output
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        return null;
      }

      // Prioritize native Windows executables/scripts over extensionless Unix wrappers
      const preferredExtensions = ['.cmd', '.exe', '.bat'];
      for (const ext of preferredExtensions) {
        const match = lines.find((line) => line.toLowerCase().endsWith(ext));
        if (match) {
          return match;
        }
      }

      return lines[0];
    } else {
      const output = execFileSync('which', [binaryName], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const trimmed = output.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  } catch {
    return null;
  }
}

/**
 * Discovers all supported agents present on the system.
 */
export function discoverAgents(): DiscoveredAgent[] {
  const results: DiscoveredAgent[] = [];

  for (const [id, def] of Object.entries(SUPPORTED_AGENTS)) {
    const resolvedPath = findExecutable(def.binary);
    results.push({
      id,
      name: def.name,
      binary: def.binary,
      path: resolvedPath || '',
      available: Boolean(resolvedPath),
    });
  }

  return results;
}

/**
 * Returns only the currently available/installed agents.
 */
export function getAvailableAgents(): DiscoveredAgent[] {
  return discoverAgents().filter((a) => a.available);
}
