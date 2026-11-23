import { AgentDefinition, ExecutionOptions, ExecutionResult } from './types.js';
/**
 * Strips ANSI color sequences and terminal cursor controls from text.
 */
export declare function stripAnsi(text: string): string;
/**
 * Parses structured JSON or NDJSON output to extract human-readable text.
 */
export declare function extractAgentResponse(rawText: string): string;
/**
 * Spawns an agent process non-interactively with closed stdin and timeout protection.
 */
export declare function executeAgentTask(agent: AgentDefinition, prompt: string, options?: ExecutionOptions): Promise<ExecutionResult>;
