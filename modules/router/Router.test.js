/* eslint-disable no-underscore-dangle */
import {
  describe, test, expect,
} from 'bun:test';
import Router from './Router.js';

describe('router class', async () => {
  await test('basic', async () => {
    const router = new Router();

    expect(router).toBeInstanceOf(Router);
    expect(router).toHaveProperty('addProcesses');
    expect(router).toHaveProperty('addRouteProcesses');
    expect(router).toHaveProperty('addMethodProcesses');
    expect(router).toHaveProperty('route');
    expect(router).toHaveProperty('batch');
    expect(router).toHaveProperty('marge');
    expect(router).toHaveProperty('routing');
    expect(router).toHaveProperty('toString');
  });

  await test('prefix', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(router.routeTree.api.v1).toBeDefined();

    // eslint-disable-next-line no-new
    expect(() => { new Router({ prefix: '/api/v1/@' }); }).toThrow();
  });

  await test('addProcesses', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.addProcesses({}); }).toThrow();

    router.addProcesses(() => {}, () => {});

    expect(router.routeTree._processes.length).toBe(2);
  });

  await test('addRouteProcesses', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.addRouteProcesses({}); }).toThrow();

    router.addRouteProcesses(() => {}, () => {});

    expect(router.routeTree._routeProcesses.length).toBe(2);
  });

  await test('addMethodProcesses', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.addMethodProcesses('_get', () => {}); }).toThrow();

    expect(() => { router.addMethodProcesses('get'); }).toThrow();

    expect(() => { router.addMethodProcesses('get', {}); }).toThrow();

    router.addMethodProcesses('get', () => {}, () => {});

    expect(router.methodProcesses.GET.length).toBe(2);
  });

  await test('route', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.route('get:/@', () => {}); }).toThrow();

    expect(() => { router.route('get:/'); }).toThrow();

    expect(() => { router.route('/users', () => {}); }).toThrow();

    router.route('get:/', () => {});

    expect(router.routeTree.api.v1.GET).toBeDefined();

    router.route('get:/', () => {});

    expect(router.routeTree.api.v1.GET._processes.length).toBe(2);

    router.route('get:/users', () => {}, () => {});

    expect(router.routeTree.api.v1.users.GET).toBeDefined();

    expect(router.routeTree.api.v1.users.GET._processes.length).toBe(2);

    router.route('post:/users', () => {});

    expect(router.routeTree.api.v1.users.POST).toBeDefined();

    router.route('get:/users/:id', () => {});

    expect(router.routeTree.api.v1.users[':param'].GET).toBeDefined();

    router.route('get:/users/:email/sent', () => {});

    expect(router.routeTree.api.v1.users[':param'].sent.GET).toBeDefined();
    expect(router.routeTree.api.v1.users[':param']._params.size).toBe(2);
  });

  await test('batch', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.batch({}); }).toThrow();

    router.batch([
      ['get:/users', () => {}],
      ['post:/users', () => {}],
      ['get:/users/:id', () => {}],
    ]);

    expect(router.routeTree.api.v1.users.GET).toBeDefined();
    expect(router.routeTree.api.v1.users.POST).toBeDefined();
    expect(router.routeTree.api.v1.users[':param'].GET).toBeDefined();
  });

  await test('marge', async () => {
    const router = new Router({ prefix: '/api/v1' });

    expect(() => { router.marge({}); }).toThrow();

    router.batch([
      ['get:/users', () => {}],
      ['get:/users/:id', () => {}],
    ]);

    expect(router.routeTree.api.v1.users.GET).toBeDefined();
    expect(router.routeTree.api.v1.users[':param'].GET).toBeDefined();
    expect(router.routeTree.api.v1.users[':param'].GET._processes.length).toBe(1);

    const users = new Router({ prefix: '/api/v1/users' });

    users.batch([
      ['post:/', () => {}],
      ['get:/:id', () => {}],
      ['put:/:id', () => {}],
    ]);

    router.marge(users);

    expect(router.routeTree.api.v1.users.POST).toBeDefined();
    expect(router.routeTree.api.v1.users[':param'].GET._processes.length).toBe(2);
    expect(router.routeTree.api.v1.users[':param'].PUT).toBeDefined();

    const notifications = new Router({ prefix: '/api/v1/notifications' });

    notifications.batch([
      ['get:/', () => {}],
      ['get:/:id', () => {}],
    ]);

    router.marge(notifications);

    // console.log(router.toString());

    expect(router.routeTree.api.v1.notifications.GET).toBeDefined();
  });

  await test('routing', async () => {
    const router = new Router({ prefix: '/api/v1' });

    router.addProcesses(() => {});

    router.addMethodProcesses('GET', () => {});

    router.batch([
      ['get:/users', () => {}],
      ['get:/users/:id', () => {}],
    ]);

    router.routeTree.api.v1.addProcesses(() => {});

    let matchedRoute = router.routing({
      method: 'GET',
      path: '/api/v1/users/1000',
    });

    expect(matchedRoute.path).toBe('GET:/api/v1/users/:id');
    expect(matchedRoute.params).toEqual({ id: '1000' });
    expect(matchedRoute.processes.length).toBe(4);

    matchedRoute = router.routing({
      method: 'GET',
      path: '/api/v1/users/1000/notifications',
    });

    expect(matchedRoute).toBe(undefined);

    matchedRoute = router.routing({
      method: 'POST',
      path: '/api/v1/users',
    });

    expect(matchedRoute).toBe(undefined);

    router.route('GET:/users/:id/notifications/:id', () => {});

    matchedRoute = router.routing({
      method: 'GET',
      path: '/api/v1/users/1000/notifications/2000',
    });

    expect(matchedRoute.params.id).toBe('2000');
  });
});
