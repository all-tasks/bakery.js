/* eslint-disable no-new */

import {
  describe, test, expect,
} from 'bun:test';

import { Router } from '#modules/router';

describe('module "router" - class "Router"', async () => {
  test('validate arguments', async () => {
    expect(() => { new Router(); }).not.toThrow();
    expect(() => { new Router({ prefix: true }); }).toThrow();
    expect(() => { new Router({ prefix: '@@' }); }).toThrow();
    expect(() => { new Router({ prefix: '/api', methodSteps: [] }); }).toThrow();
    expect(() => { new Router({ prefix: '/api', methodSteps: { GET: [true] } }); }).toThrow();
    expect(() => {
      new Router({
        prefix: '/api',
        methodSteps: { GET: [() => {}] },
      });
    }).not.toThrow();
  });
});
