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

export const SUPPORTED_AGENTS: Record<string, AgentDefinition> = {
  opencode: {
    id: "opencode",
    name: "OpenCode",
    binary: "opencode",
    buildArgs: (prompt: string, options?: ExecutionOptions) => {
      const args = ["run", prompt, "--auto", "--format", "json"];
      if (options?.sessionId) {
        args.push("--session", options.sessionId);
      }
      return args;
    },
  },
  agy: {
    id: "agy",
    name: "Antigravity CLI",
    binary: "agy",
    buildArgs: (prompt: string, options?: ExecutionOptions) => {
      const args = [
        "-p",
        prompt,
        "--mode",
        "auto",
        "--dangerously-skip-permissions",
        "--output-format",
        "json",
      ];
      if (options?.sessionId) {
        args.push("--conversation", options.sessionId);
      }
      return args;
    },
  },
  claude: {
    id: "claude",
    name: "Claude Code",
    binary: "claude",
    buildArgs: (prompt: string, options?: ExecutionOptions) => {
      const args = [
        "-p",
        prompt,
        "--dangerously-skip-permissions",
        "--output-format",
        "json",
      ];
      if (options?.sessionId) {
        args.push("--resume", options.sessionId);
      }
      return args;
    },
  },
};
