import { test } from 'node:test';
import assert from 'node:assert';
import { SUPPORTED_AGENTS } from '../src/types.js';

test('opencode builds correct non-interactive args', () => {
  const agent = SUPPORTED_AGENTS.opencode;
  assert.ok(agent);
  const args = agent.buildArgs('test prompt');
  assert.deepStrictEqual(args, ['run', 'test prompt', '--auto', '--format', 'json']);

  const argsWithSession = agent.buildArgs('test prompt', { sessionId: 'sess-123' });
  assert.deepStrictEqual(argsWithSession, [
    'run',
    'test prompt',
    '--auto',
    '--format',
    'json',
    '--session',
    'sess-123',
  ]);
});

test('agy builds correct non-interactive args', () => {
  const agent = SUPPORTED_AGENTS.agy;
  assert.ok(agent);
  const args = agent.buildArgs('test prompt');
  assert.deepStrictEqual(args, [
    '-p',
    'test prompt',
    '--mode',
    'auto',
    '--dangerously-skip-permissions',
    '--output-format',
    'json',
  ]);

  const argsWithSession = agent.buildArgs('test prompt', { sessionId: 'conv-456' });
  assert.deepStrictEqual(argsWithSession, [
    '-p',
    'test prompt',
    '--mode',
    'auto',
    '--dangerously-skip-permissions',
    '--output-format',
    'json',
    '--conversation',
    'conv-456',
  ]);
});

test('claude builds correct non-interactive args', () => {
  const agent = SUPPORTED_AGENTS.claude;
  assert.ok(agent);
  const args = agent.buildArgs('test prompt');
  assert.deepStrictEqual(args, [
    '-p',
    'test prompt',
    '--dangerously-skip-permissions',
    '--output-format',
    'json',
  ]);
});
