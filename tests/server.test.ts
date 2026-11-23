import { test } from 'node:test';
import assert from 'node:assert';
import { discoverAgents } from '../src/discovery.js';
import { extractAgentResponse } from '../src/runner.js';

test('extractAgentResponse parses NDJSON text parts', () => {
  const ndjson = [
    '{"type":"step_start","timestamp":100}',
    '{"type":"text","part":{"text":"Line 1"}}',
    '{"type":"text","part":{"text":"Line 2"}}',
    '{"type":"step_finish"}',
  ].join('\n');

  const clean = extractAgentResponse(ndjson);
  assert.strictEqual(clean, 'Line 1\nLine 2');
});

test('extractAgentResponse handles standard raw strings gracefully', () => {
  const plain = 'Hello world output';
  assert.strictEqual(extractAgentResponse(plain), 'Hello world output');
});

test('discoverAgents identifies local opencode and agy', () => {
  const agents = discoverAgents();
  const available = agents.filter((a) => a.available);
  assert.ok(available.length >= 2, 'Should detect at least opencode and agy on this host');
});
