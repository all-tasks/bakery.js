/* eslint-disable no-new */

import {
  describe, test, expect,
} from 'bun:test';

import { Node } from '#modules/router';

describe('module "router" - class "Node"', async () => {
  test('validate arguments', async () => {
    expect(() => { new Node(); }).toThrow();
    expect(() => { new Node(true, true); }).toThrow();
    expect(() => { new Node('@@', [true]); }).toThrow();
    expect(() => { new Node('users', () => {}); }).not.toThrow();
  });
  test('create node without steps', async () => {

  });
});
