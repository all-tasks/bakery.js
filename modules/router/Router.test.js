import { expect, test } from 'bun:test';
import Router from './Router.js';

test('router class basic test', async () => {
  const router = new Router();

  expect(router).toBeInstanceOf(Router);
  expect(router).toHaveProperty('route');
  expect(router).toHaveProperty('batch');
  expect(router).toHaveProperty('graft');
});

test('router class prefix and add route test', async () => {
  const router = new Router({ prefix: '/api/v1' });

  expect(router.routeTree).toEqual({ api: { v1: {} } });

  router.route('get:/users', () => {}, () => {});

  expect(router.routeTree.api.v1.users.GET.path).toBe('GET:/api/v1/users');
  expect(router.routeTree.api.v1.users.GET.controllers.length).toBe(2);

  router.route('post:/users', () => {});

  expect(Object.keys(router.routeTree.api.v1.users)).toEqual(['GET', 'POST']);

  router.route('get:/users/:id', () => {});
});
