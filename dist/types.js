export const SUPPORTED_AGENTS = {
    opencode: {
        id: "opencode",
        name: "OpenCode",
        binary: "opencode",
        buildArgs: (prompt, options) => {
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
        buildArgs: (prompt, options) => {
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
        buildArgs: (prompt, options) => {
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
