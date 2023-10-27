/* eslint-disable no-underscore-dangle */
import { expect, test } from 'bun:test';
import Router from './Router.js';

await test('router class basic test', async () => {
  const router = new Router();

  expect(router).toBeInstanceOf(Router);
  expect(router).toHaveProperty('route');
  expect(router).toHaveProperty('batch');
  expect(router).toHaveProperty('marge');
  expect(router).toHaveProperty('routing');
  expect(router).toHaveProperty('toString');
});

await test('router class prefix and add route test', async () => {
  const router = new Router({ prefix: '/api/v1' });

  expect(router.routeTree.api.v1).toBeDefined();

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

  console.log(router.toString());

  expect(router.routeTree.api.v1.users[':param'].sent.GET).toBeDefined();
  expect(router.routeTree.api.v1.users[':param']._params.length).toBe(2);

  // console.log(router.toString());
});

// await test('router class batch test', async () => {
//   const router = new Router({ prefix: '/api/v1' });

//   router.batch([
//     ['get:/users', () => {}],
//     ['post:/users', () => {}],
//     ['get:/users/:id', () => {}],
//   ]);

//   // console.log(router.toString());

//   expect(router.routeTree.api.v1.users.GET).toBeDefined();
//   expect(router.routeTree.api.v1.users.POST).toBeDefined();
//   expect(router.routeTree.api.v1.users[':param'].GET).toBeDefined();
// });

// await test('router class marge test', async () => {
//   const router = new Router({ prefix: '/api/v1' });

//   router.batch([
//     ['get:/users', () => {}],
//     ['get:/users/:id', () => {}],
//   ]);

//   // console.log(router.toString());

//   expect(router.routeTree.api.v1.users.GET).toBeDefined();
//   expect(router.routeTree.api.v1.users[':param'].GET).toBeDefined();
//   expect(router.routeTree.api.v1.users[':param'].GET._processes.length).toBe(1);

//   const users = new Router({ prefix: '/api/v1/users' });

//   users.batch([
//     ['post:/', () => {}],
//     ['get:/:id', () => {}],
//     ['put:/:id', () => {}],
//   ]);

//   router.marge(users);

//   expect(router.routeTree.api.v1.users.POST).toBeDefined();
//   expect(router.routeTree.api.v1.users[':param'].GET._processes.length).toBe(2);
//   expect(router.routeTree.api.v1.users[':param'].PUT).toBeDefined();

//   const notifications = new Router({ prefix: '/api/v1/notifications' });

//   notifications.batch([
//     ['get:/', () => {}],
//     ['get:/:id', () => {}],
//   ]);

//   router.marge(notifications);

//   expect(router.routeTree.api.v1.notifications.GET).toBeDefined();
// });
