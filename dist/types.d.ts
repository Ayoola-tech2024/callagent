export interface ExecutionOptions {
    cwd?: string;
    timeoutMs?: number;
    sessionId?: string;
    rawOutput?: boolean;
}
export interface ExecutionResult {
    agentId: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
    timedOut: boolean;
}
export interface AgentDefinition {
    id: string;
    name: string;
    binary: string;
    buildArgs: (prompt: string, options?: ExecutionOptions) => string[];
    defaultEnv?: Record<string, string>;
}
export interface DiscoveredAgent {
    id: string;
    name: string;
    binary: string;
    path: string;
    available: boolean;
}
export declare const SUPPORTED_AGENTS: Record<string, AgentDefinition>;
