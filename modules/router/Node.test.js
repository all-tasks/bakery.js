import { expect, test } from 'bun:test';
import Node from './Node.js';

await test('node class basic test', async () => {
  const node = new Node('test');

  expect(node).toBeInstanceOf(Node);
  expect(node).toHaveProperty('addNode');
  expect(node).toHaveProperty('addRoute');
  expect(node).toHaveProperty('addProcesses');
});
