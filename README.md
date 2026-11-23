# CallAgent 🚀
> Universal Local Agent-to-Agent (A2A) MCP Bridge

`callagent` is a lightweight, zero-config MCP server that bridges desktop AI agents. It enables **Antigravity**, **Claude Desktop**, **Cursor**, or any MCP-compatible environment to delegate coding tasks, run terminal execution, and review work through other local CLI agents (**OpenCode**, **Antigravity CLI / agy**, and **Claude Code**) without manual clipboard copy-pasting.

---

## 💡 How It Works

Instead of acting as a human network cable (copying text from Antigravity, pasting into OpenCode, and copying back):

```
┌─────────────────────────────────┐
│     Calling Agent (Antigravity) │
└───────────────┬─────────────────┘
                │ MCP (stdio)
┌───────────────▼─────────────────┐
│   callagent (MCP Bridge Server) │
│   • Auto-detects local agents   │
│   • Windows .cmd / .exe safe    │
│   • Auto-approval & ANSI clean  │
└───────┬─────────────────┬───────┘
        │ Subprocess      │ Subprocess
┌───────▼───────┐ ┌───────▼───────┐
│   OpenCode    │ │  Antigravity  │
│ `opencode.cmd`│ │   `agy.exe`   │
└───────────────┘ └───────────────┘
```

1. **Auto-Discovery:** Scans `PATH` for installed agent binaries.
2. **Headless Execution:** Invokes agents with verified non-interactive flags (`--auto`, `--dangerously-skip-permissions`).
3. **Structured Response Extraction:** Strips ANSI escape codes, parses NDJSON / JSON lines, and returns clean markdown text directly to the calling agent.

---

## 🛠️ MCP Tools Exposed

### `list_agents`
Lists all detected agent CLIs on your computer, their executable paths, and whether they are ready to receive tasks.

### `delegate_task`
Dispatches a prompt non-interactively to an installed agent.
- `agent`: Target agent (`"opencode"`, `"agy"`, `"claude"`)
- `prompt`: Task instructions
- `cwd` *(optional)*: Working directory path
- `sessionId` *(optional)*: Session or conversation ID for multi-turn continuity
- `timeoutMs` *(optional)*: Max duration before graceful termination (default: 120s)

---

## ⚡ Quick Start

### 1. Build
```bash
cd callagent
npm install
npm run build
```

### 2. Add to your Antigravity / Claude MCP Configuration
Add to your `mcpServers` config:

```json
{
  "mcpServers": {
    "callagent": {
      "command": "node",
      "args": ["c:/Users/HP/Downloads/Damisile/callagent/dist/index.js"]
    }
  }
}
```

Or run directly with `tsx`:
```json
{
  "mcpServers": {
    "callagent": {
      "command": "node",
      "args": [
        "--import",
        "tsx",
        "c:/Users/HP/Downloads/Damisile/callagent/src/index.ts"
      ]
    }
  }
}
```

---

## 🧪 Testing

Run the full unit test suite:
```bash
npm test
```
