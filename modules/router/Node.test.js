import { describe, test, expect } from 'bun:test';
import Node from './Node.js';

describe('node class', async () => {
  await test('basic', async () => {
    const node = new Node('test');

    expect(node).toBeInstanceOf(Node);
    expect(node).toHaveProperty('addNode');
    expect(node).toHaveProperty('addRoute');
    expect(node).toHaveProperty('addProcesses');

    // eslint-disable-next-line no-new
    expect(() => { new Node('_test'); }).toThrow();
    // eslint-disable-next-line no-new
    expect(() => { new Node('test', {}); }).toThrow();

    expect(() => { new Node('test').addNode('_test'); }).toThrow();
    expect(() => { new Node('test').addNode('test', {}); }).toThrow();
    expect(() => { new Node('test').addRoute('@', 'GET:/', () => {}); }).toThrow();
    expect(() => { new Node('test').addRoute('GET', 'GET:/~', () => {}); }).toThrow();
    expect(() => { new Node('test').addRoute('GET', 'GET:/', {}); }).toThrow();
    expect(() => { new Node('test').addProcesses({}); }).toThrow();
  });

  await test('margeNode', async () => {
    const node = new Node('foo');
    node.margeNode(new Node('bar'));
  });
});
