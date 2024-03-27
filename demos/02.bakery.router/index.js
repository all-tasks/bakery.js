#!/usr/bin/env bun

import Bakery from '#bakery';

import { Router } from '#modules';

const port = 6001;

const bakery = new Bakery({
  port,
});

const router = new Router({
  prefix: '/api',
});

router.addMethodSteps('GET', async function getMethod() {
  console.info('this is a "GET" method request');
  await this.steps.next();
});

router.addGlobalSteps(
  async function logger() {
    console.info(`request "${this.request.method}:${this.request.url}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.url}"`);
  },
);

router.addRoute('GET:/users', async function getUsers() {
  console.info(JSON.stringify({ query: this.request.query }));
  this.response.body = 'get users';
  await this.steps.next();
});

bakery.addSteps(
  router.routing(),
);

const host = `http://localhost:${port}`;

await fetch(`${host}/api/users?role=admin`)
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    if (res)console.debug(`fetch: ${res}`);
  });

await fetch(`${host}/api/users`, { method: 'POST' })
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    if (res)console.debug(`fetch: ${res}`);
  });