/* eslint-disable no-new */

import {
  describe, test, expect, vi,
} from 'vitest';

import { Route } from '#modules/router';

describe('module "router" - class "Route"', async () => {
  test('validate arguments', async () => {
    expect(() => { new Route(); }).toThrow();
    expect(() => { new Route(true, true, true); }).toThrow();
    expect(() => { new Route('@@', true, true); }).toThrow();
    expect(() => { new Route('GET', true, true); }).toThrow();
    expect(() => { new Route('GET', '@@', true); }).toThrow();
    expect(() => { new Route('GET', 'GET:/api/users', true); }).toThrow();
    expect(() => { new Route('GET', 'GET:/', () => {}); }).not.toThrow();
    expect(() => { new Route('GET', 'GET:/api/users', () => {}); }).not.toThrow();
    console.warn = vi.fn();
    new Route('GET', 'GET:/api/users');
    expect(console.warn).not.toBeCalled();
    new Route('ABC', 'ABC:/api/users');
    expect(console.warn).toBeCalled();
  });
  test('all "route" properties are readonly', async () => {
    const route = new Route('GET', 'GET:/api/users');
    Object.keys(route).forEach((key) => {
      expect(() => { route[key] = true; }).toThrow();
    });
  });
  test('set "method", and readonly', async () => {
    const route = new Route('GET', 'GET:/api/users', () => {});
    expect(route.method).toBe('GET');
    expect(() => { route.method = 'POST'; }).toThrow();
  });
  test('set "routePath", and readonly', async () => {
    const route = new Route('GET', 'GET:/api/users', () => {});
    expect(route.path).toBe('GET:/api/users');
    expect(() => { route.path = 'POST:/api/users'; }).toThrow();
  });
  test('set "steps", and readonly', async () => {
    function first() {}
    const route = new Route('GET', 'GET:/api/users', first);
    expect(route.steps).toEqual([first]);
    expect(() => { route.steps = [first]; }).toThrow();
    expect(() => { route.steps.push(first); }).toThrow();
  });
  test('"proxy" make instance readonly', async () => {
    const route = new Route('GET', 'GET:/api/users');
    expect(route.proxy).toBeInstanceOf(Route);
    expect(() => { route.proxy.method = 'POST'; }).toThrow();
    expect(route.proxy.proxy).toBeUndefined();
    expect(() => { route.proxy.addSteps(() => {}); }).toThrow();
  });
  test('method "addSteps"', async () => {
    function first() {}
    function second() {}
    const route = new Route('GET', 'GET:/api/users', first);
    expect(route.steps.length).toBe(1);
    expect(route.addSteps(second).steps.length).toBe(2);
    expect(route.steps).toEqual([first, second]);
    expect(() => { route.addSteps({}); }).toThrow();
  });
  test('method "updateMeta"', async () => {
    const route = new Route('GET', 'GET:/api/users');
    expect(() => { route.updateMeta([]); }).toThrow();
    const meta = { name: 'get users' };
    route.updateMeta(meta);
    expect(route.meta).toEqual(meta);
    expect(() => { route.meta = {}; }).toThrow();
    route.updateMeta({
      description: 'get users and filter by query',
    });
    expect(route.meta).toEqual({
      name: 'get users',
      description: 'get users and filter by query',
    });
  });
  test('method "toString"', async () => {
    const route = new Route('GET', 'GET:/api/users');
    expect(route.toString()).toBe('{"method":"GET","path":"GET:/api/users","meta":{}}');
  });
  test('static method "parseRoutePath"', async () => {
    expect(() => { Route.parseRoutePath(); }).toThrow();
    expect(() => { Route.parseRoutePath(''); }).toThrow();
    expect(() => { Route.parseRoutePath('GET:/api/users/::id'); }).toThrow();
    expect(Route.parseRoutePath('GET:/api/users')).toEqual({
      method: 'GET',
      path: '/api/users',
      segments: ['api', 'users'],
    });
    expect(Route.parseRoutePath('GET:/api/users/:id/:action')).toEqual({
      method: 'GET',
      path: '/api/users/:id/:action',
      segments: ['api', 'users', ':id', ':action'],
      params: ['id', 'action'],
    });
  });
  test.skip('static method "matchRoutePath"', async () => {
    expect(Route.matchRoutePath('GET:/api/users', 'GET', '/api/users')).toBe(true);
  });
});
