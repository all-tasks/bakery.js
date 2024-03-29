/* eslint-disable no-new */

import {
  describe, test, expect,
} from 'bun:test';

import { Node } from '#modules/router';

describe('module "router" - class "Node"', async () => {
  test('validate arguments', async () => {
    expect(() => { new Node(); }).toThrow();
    expect(() => { new Node(true, true); }).toThrow();
    expect(() => { new Node('@@', true); }).toThrow();
    expect(() => { new Node('users', true); }).toThrow();
    expect(() => { new Node('users'); }).not.toThrow();
  });
  test('set "segment", and readonly', async () => {
    const node = new Node('users');
    expect(node.segment).toBe('users');
    expect(() => { node.segment = 'users'; }).toThrow();
  });
  test('set "segments" as a parameter', async () => {
    const node = new Node(':userId');
    expect(node.segment).toBe(':param');
    expect(node.params).toEqual(['userId']);
    expect(() => { node.params = ['users']; }).toThrow();
    expect(() => { node.params.push('users'); }).toThrow();
  });
  test('set "steps", and readonly', async () => {
    function first() {}
    const node = new Node('users', first);
    expect(node.steps).toEqual([first]);
    expect(() => { node.steps = [first]; }).toThrow();
    expect(() => { node.steps.push(first); }).toThrow();
  });
  test('method "addParams"', async () => {
    const node = new Node(':userId');
    expect(node.params.length).toBe(1);
    expect(node.addParams().params.length).toBe(1);
    expect(node.addParams(':id').params.length).toBe(2);
    expect(node.params).toEqual(['userId', 'id']);
    expect(() => { node.addParams(':@'); }).toThrow();
  });
  test('method "addSteps"', async () => {
    function first() {}
    function second() {}
    const node = new Node('users', first);
    expect(node.steps.length).toBe(1);
    expect(node.addSteps(second).steps.length).toBe(2);
    expect(node.steps).toEqual([first, second]);
    expect(() => { node.addSteps({}); }).toThrow();
  });
  test('method "addNode"', async () => {
    const node = new Node('users');
    expect(Object.keys(node.nodes).length).toBe(0);
    expect(() => { node.addNode(); }).toThrow();
    expect(node.addNode('current')).toBeInstanceOf(Node);
    expect(Object.keys(node.nodes).length).toBe(1);
    node.addNode(':userId');
    expect(Object.keys(node.nodes).length).toBe(2);
    expect(node.nodes[':param']).toBeDefined();
    expect(node.nodes[':param'].params.length).toBe(1);
    node.addNode(':id');
    expect(Object.keys(node.nodes).length).toBe(2);
    expect(node.nodes[':param'].params.length).toBe(2);
  });
  test('method "margeNode"', async () => {
    const node = new Node('users');
    const other = new Node('users');
    other.addParams(':module');
    other.addSteps(() => {});
    other.addNode(':userId').addNode(':action');
    other.addRoute('GET', 'GET:/api/users');
    expect(() => { node.margeNode(); }).toThrow();
    expect(() => { node.margeNode(other); }).not.toThrow();
    expect(node.params.length).toBe(1);
    expect(node.steps.length).toBe(1);
    expect(Object.values(node.nodes).length).toBe(1);
    expect(Object.values(Object.values(node.nodes)[0].nodes).length).toBe(1);
    expect(Object.values(node.routes).length).toBe(1);
  });
  test('method "addRoute"', async () => {
    const node = new Node('users');
    expect(Object.keys(node.routes).length).toBe(0);
    expect(() => { node.addRoute(); }).toThrow();
    expect(() => { node.addRoute('GET'); }).toThrow();
    expect(() => { node.addRoute('GET', 'GET:/api/users'); }).not.toThrow();
    expect(() => { node.addRoute('GET', 'GET:/api/users', () => {}); }).toThrow();
    expect(Object.keys(node.routes).length).toBe(1);
  });
  test('method "toString"', async () => {
    const node = new Node('users');
    expect(node.toString()).toBe('{"segment":"users","params":[],"steps":[],"nodes":{},"routes":{}}');
  });
});
