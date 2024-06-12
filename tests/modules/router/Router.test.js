/* eslint-disable no-new */

import {
  describe, test, expect, vi,
} from 'vitest';

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
  test('all "router" properties are readonly', async () => {
    const router = new Router();
    Object.keys(router).forEach((key) => {
      expect(() => { router[key] = true; }).toThrow();
    });
  });
  test('method "addGlobalSteps"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(router.routeTree.steps.length).toBe(0);
    expect(router.addGlobalSteps(() => {})).toBe(router);
    expect(router.routeTree.steps.length).toBe(1);
  });
  test('method "addMethodSteps"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(router.methodSteps).toEqual({});
    expect(() => { router.addMethodSteps(true, true); }).toThrow();
    router.addMethodSteps('get', () => {});
    expect(router.methodSteps).toEqual({ GET: [expect.any(Function)] });
  });
  test('method "route"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(() => { router.route(true); }).toThrow();
    expect(() => { router.route('GET:/users'); }).not.toThrow();
    expect(router.routeTree.nodes.api.nodes.users.routes.GET).toBeDefined();
    expect(() => { router.addRoute('GET:/accounts'); }).not.toThrow();
    expect(router.routeTree.nodes.api.nodes.accounts.routes.GET).toBeDefined();
  });
  test('method "batch"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(() => { router.batch(true); }).toThrow();
    expect(() => { router.batch([true]); }).toThrow();
    expect(() => {
      router.batch([
        ['GET:/users', () => {}],
        ['GET:/users/:id', () => {}],
      ]);
    }).not.toThrow();
    expect(router.routeTree.nodes.api.nodes.users.routes.GET).toBeDefined();
    expect(router.routeTree.nodes.api.nodes.users.nodes[':param'].routes.GET).toBeDefined();
  });
  test('method "merge"', async () => {
    console.warn = vi.fn();
    const router = new Router({ prefix: '/api' });
    expect(() => { router.merge(); }).toThrow();
    expect(() => { router.merge({}); }).toThrow();
    const usersRouter = new Router({ prefix: '/api/users' });
    usersRouter.addMethodSteps('GET', () => {});
    usersRouter.addRoute('GET:/', () => {});
    expect(() => { router.merge(usersRouter); }).not.toThrow();
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(router.routeTree.nodes.api.nodes.users.routes.GET).toBeDefined();
  });
  test.todo('method "globMerge"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(async () => { await router.globMerge(); }).toThrow();
  });
  test('method "routing"', async () => {
    const router = new Router({ prefix: '/api' });
    const everyGet = vi.fn();
    router.addMethodSteps('GET', everyGet);
    const getUsers = vi.fn();
    router.addRoute('GET:/users/:id', getUsers);
    const context = {
      request: {
        method: 'GET',
        path: '/api/users/100',
        params: [],
      },
      response: {
        status: 400,
      },
      steps: {
        after: vi.fn(),
        next: vi.fn(),
      },
    };
    router.routing().apply(context);
    expect(context.route).toBeDefined();
    expect(context.request.params).toEqual({ id: '100' });
    expect(context.response.status).toBe(200);
    expect(context.steps.after).toHaveBeenCalledWith(everyGet, getUsers);
    expect(context.steps.next).toHaveBeenCalledTimes(1);
  });
  test('method "getAllRoutes"', async () => {
    const router = new Router({ prefix: '/api' });
    expect(() => { router.getAllRoutes('string'); }).toThrow();
    expect(router.getAllRoutes()).toEqual([]);
    router.addRoute('OPTIONS:/users', () => {});
    router.addRoute('POST:/users', () => {});
    router.addRoute('GET:/users', () => {});
    router.addRoute('GET:/users/:id', () => {});
    router.addRoute('PUT:/users/:id', () => {});
    router.addRoute('PATCH:/users/:id', () => {});
    router.addRoute('DELETE:/users/:id', () => {});
    router.addRoute('GET:/accounts', () => {});
    let routes = [];
    expect(() => { routes = router.getAllRoutes(); }).not.toThrow();
    expect(routes.length).toBe(8);
    expect(Object.keys(router.getAllRoutes('object'))).toEqual([
      'GET:/api/accounts',
      'POST:/api/users',
      'GET:/api/users',
      'OPTIONS:/api/users',
      'GET:/api/users/:id',
      'PUT:/api/users/:id',
      'PATCH:/api/users/:id',
      'DELETE:/api/users/:id',
    ]);
  });
  test('"method" method', async () => {
    const router = new Router({ prefix: '/api' });
    router.get('/users', () => {});
    router.post('/users', () => {});
  });
});
