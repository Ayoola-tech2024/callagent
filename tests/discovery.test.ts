import { test } from 'node:test';
import assert from 'node:assert';
import { findExecutable, discoverAgents } from '../src/discovery.js';

test('findExecutable finds system executables or returns null for non-existent', () => {
  const nodePath = findExecutable('node');
  assert.ok(nodePath, 'Should find node binary');
  assert.ok(nodePath.toLowerCase().includes('node'), 'Path should contain node');

  const nonExistent = findExecutable('some_impossible_binary_name_xyz_123');
  assert.strictEqual(nonExistent, null);
});

test('discoverAgents returns list of supported agents with availability status', () => {
  const agents = discoverAgents();
  assert.ok(Array.isArray(agents));
  assert.ok(agents.length >= 3);

  const opencode = agents.find((a) => a.id === 'opencode');
  assert.ok(opencode);
  // On this test machine, opencode is installed:
  assert.strictEqual(opencode.available, true);
  assert.ok(opencode.path.length > 0);

  const agy = agents.find((a) => a.id === 'agy');
  assert.ok(agy);
  // On this test machine, agy is installed:
  assert.strictEqual(agy.available, true);
  assert.ok(agy.path.length > 0);
});
