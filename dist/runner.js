import { spawn } from 'node:child_process';
import os from 'node:os';
import { findExecutable } from './discovery.js';
const isWindows = os.platform() === 'win32';
/**
 * Strips ANSI color sequences and terminal cursor controls from text.
 */
export function stripAnsi(text) {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}
/**
 * Parses structured JSON or NDJSON output to extract human-readable text.
 */
export function extractAgentResponse(rawText) {
    const trimmed = stripAnsi(rawText).trim();
    if (!trimmed)
        return '';
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const textParts = [];
    let jsonLinesDetected = false;
    for (const line of lines) {
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const parsed = JSON.parse(line);
                jsonLinesDetected = true;
                if (parsed.type === 'text' && parsed.part?.text) {
                    textParts.push(parsed.part.text);
                }
                else if (parsed.content) {
                    textParts.push(typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content));
                }
                else if (parsed.response) {
                    textParts.push(parsed.response);
                }
            }
            catch {
                // Not a JSON line
            }
        }
    }
    if (jsonLinesDetected && textParts.length > 0) {
        return textParts.join('\n');
    }
    // Try parsing entire stdout as a single JSON payload
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed.result) {
                return typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result, null, 2);
            }
            if (parsed.response) {
                return typeof parsed.response === 'string' ? parsed.response : JSON.stringify(parsed.response, null, 2);
            }
            if (parsed.content) {
                return typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content, null, 2);
            }
        }
        catch {
            // Not single JSON
        }
    }
    return trimmed;
}
/**
 * Spawns an agent process non-interactively with closed stdin and timeout protection.
 */
export async function executeAgentTask(agent, prompt, options) {
    const startTime = Date.now();
    const timeoutMs = options?.timeoutMs ?? 120000;
    const cwd = options?.cwd || process.cwd();
    const binaryPath = findExecutable(agent.binary) || agent.binary;
    const args = agent.buildArgs(prompt, options);
    // On Windows, only .cmd and .bat files require shell execution. Native .exe binaries should run without shell.
    const lowerPath = binaryPath.toLowerCase();
    const needsShell = isWindows && (lowerPath.endsWith('.cmd') || lowerPath.endsWith('.bat'));
    return new Promise((resolve) => {
        let timedOut = false;
        let stdoutData = '';
        let stderrData = '';
        const child = spawn(binaryPath, args, {
            cwd,
            shell: needsShell,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                ...(agent.defaultEnv || {}),
                CI: '1',
                FORCE_COLOR: '0',
            },
        });
        const timer = setTimeout(() => {
            timedOut = true;
            try {
                if (isWindows && child.pid) {
                    try {
                        spawn('taskkill', ['/pid', child.pid.toString(), '/t', '/f'], { stdio: 'ignore' });
                    }
                    catch {
                        child.kill('SIGTERM');
                    }
                }
                else {
                    child.kill('SIGTERM');
                }
            }
            catch {
                // ignore
            }
        }, timeoutMs);
        child.stdout?.on('data', (chunk) => {
            stdoutData += chunk.toString('utf-8');
        });
        child.stderr?.on('data', (chunk) => {
            stderrData += chunk.toString('utf-8');
        });
        child.on('error', (err) => {
            clearTimeout(timer);
            const durationMs = Date.now() - startTime;
            resolve({
                agentId: agent.id,
                exitCode: 1,
                stdout: stripAnsi(stdoutData).trim(),
                stderr: stripAnsi(`${stderrData}\nFailed to spawn: ${err.message}`).trim(),
                durationMs,
                timedOut: false,
            });
        });
        child.on('close', (code) => {
            clearTimeout(timer);
            const durationMs = Date.now() - startTime;
            resolve({
                agentId: agent.id,
                exitCode: timedOut ? 124 : (code ?? 0),
                stdout: options?.rawOutput ? stdoutData : stripAnsi(stdoutData).trim(),
                stderr: options?.rawOutput ? stderrData : stripAnsi(stderrData).trim(),
                durationMs,
                timedOut,
            });
        });
    });
}
