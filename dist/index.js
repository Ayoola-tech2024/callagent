#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { discoverAgents, findExecutable } from './discovery.js';
import { executeAgentTask, extractAgentResponse } from './runner.js';
import { SUPPORTED_AGENTS } from './types.js';
export const server = new McpServer({
    name: 'callagent',
    version: '0.1.0',
});
// Tool 1: list_agents
server.tool('list_agents', 'List all detected coding agent CLIs on this machine (OpenCode, Antigravity CLI, Claude Code) with their installation paths and availability status.', {}, async () => {
    const agents = discoverAgents();
    const availableCount = agents.filter((a) => a.available).length;
    const summary = agents
        .map((a) => `- ${a.name} (id: "${a.id}"): ${a.available ? `READY (${a.path})` : 'NOT FOUND on PATH'}`)
        .join('\n');
    return {
        content: [
            {
                type: 'text',
                text: `Detected ${availableCount}/${agents.length} supported agents:\n\n${summary}`,
            },
        ],
    };
});
// Tool 2: delegate_task
server.tool('delegate_task', 'Dispatch a task non-interactively to an installed agent (e.g. "opencode", "agy", "claude") and retrieve its response directly into this conversation without copy-pasting.', {
    agent: z
        .string()
        .describe('Target agent ID (e.g. "opencode", "agy", "claude")'),
    prompt: z
        .string()
        .describe('The instructions or prompt for the delegated agent to execute'),
    cwd: z
        .string()
        .optional()
        .describe('Optional working directory path (defaults to current project)'),
    sessionId: z
        .string()
        .optional()
        .describe('Optional session or conversation ID to continue a previous turn'),
    timeoutMs: z
        .number()
        .optional()
        .describe('Max run time in milliseconds (default: 120000 = 2 mins)'),
}, async ({ agent: agentId, prompt, cwd, sessionId, timeoutMs }) => {
    const agentDef = SUPPORTED_AGENTS[agentId.toLowerCase().trim()];
    if (!agentDef) {
        const known = Object.keys(SUPPORTED_AGENTS).join(', ');
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Unknown agent ID "${agentId}". Supported agents are: ${known}`,
                },
            ],
        };
    }
    const binaryPath = findExecutable(agentDef.binary);
    if (!binaryPath) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Agent "${agentDef.name}" (${agentDef.binary}) is not installed or not found on system PATH.`,
                },
            ],
        };
    }
    const result = await executeAgentTask(agentDef, prompt, {
        cwd,
        sessionId,
        timeoutMs,
    });
    const cleanOutput = extractAgentResponse(result.stdout);
    const durationSec = (result.durationMs / 1000).toFixed(1);
    if (result.timedOut) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Task dispatched to ${agentDef.name} TIMED OUT after ${durationSec}s.\n\nPartial Output:\n${cleanOutput}\n\nErrors:\n${result.stderr}`,
                },
            ],
        };
    }
    if (result.exitCode !== 0) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `${agentDef.name} exited with error code ${result.exitCode} (${durationSec}s).\n\nOutput:\n${cleanOutput}\n\nErrors:\n${result.stderr}`,
                },
            ],
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: `[Delegated to ${agentDef.name} (${durationSec}s)]\n\n${cleanOutput || result.stdout}`,
            },
        ],
    };
});
export async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
// Auto-run when invoked as CLI entrypoint
runServer().catch((error) => {
    console.error('CallAgent MCP server fatal error:', error);
    process.exit(1);
});
