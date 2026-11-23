import { test } from 'node:test';
import assert from 'node:assert';
import { stripAnsi, executeAgentTask } from '../src/runner.js';
import { AgentDefinition } from '../src/types.js';

test('stripAnsi removes ANSI color codes and control characters', () => {
  const colored = '\u001b[32mSuccess\u001b[0m and \u001b[1;31mError\u001b[0m';
  assert.strictEqual(stripAnsi(colored), 'Success and Error');

  const spinner = '\u001b[?25l⠋ Loading...\u001b[?25h';
  assert.strictEqual(stripAnsi(spinner), '⠋ Loading...');
});

test('executeAgentTask executes a command, captures stdout, and enforces timeout', async () => {
  // Mock agent using node CLI
  const mockNodeAgent: AgentDefinition = {
    id: 'mock-node',
    name: 'Mock Node Agent',
    binary: 'node',
    buildArgs: (prompt: string) => ['-e', `console.log("Processed: " + ${JSON.stringify(prompt)})`],
  };

  const result = await executeAgentTask(mockNodeAgent, 'Hello Agent World', { timeoutMs: 10000 });
  assert.strictEqual(result.exitCode, 0);
  assert.ok(result.stdout.includes('Processed: Hello Agent World'));
  assert.strictEqual(result.timedOut, false);
  assert.ok(result.durationMs > 0);
});

test('executeAgentTask handles timeouts gracefully', async () => {
  const hangingAgent: AgentDefinition = {
    id: 'hang-agent',
    name: 'Hanging Agent',
    binary: 'node',
    buildArgs: () => ['-e', 'setTimeout(() => {}, 5000)'],
  };

  const result = await executeAgentTask(hangingAgent, 'hang', { timeoutMs: 500 });
  assert.strictEqual(result.timedOut, true);
  assert.ok(result.exitCode !== 0);
});
