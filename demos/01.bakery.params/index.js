#!/usr/bin/env bun

import Bakery from '#bakery';

const port = 6001;

const bakery = new Bakery({
  port,
});

bakery.addSteps(
  async function logger() {
    this.logger = console;
    console.info(`request "${this.request.method}:${this.request.path}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.path}"`);
  },
  async function router() {
    const routePath = `${this.request.method}:${this.request.path}`;
    switch (routePath) {
      case 'GET:/api/users': {
        this.response.body = {
          routePath,
          query: this.request.query,
        };
        return;
      }
      case 'POST:/api/users': {
        this.response.body = {
          routePath,
          body: await this.request.body(),
        };
        return;
      }
      default: {
        this.response.body = 'Hello, bakery.js!';
      }
    }
  },
);

const host = `http://localhost:${port}`;

await fetch(`${host}/api/users?role=admin`)
  .then((res) => {
    console.debug({ res });
    return res.json();
  }).then((res) => {
    if (res)console.debug({ res });
  });

await fetch(`${host}/api/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'lane',
    role: 'admin',
  }),
}).then((res) => {
  console.debug({ res });
  return res.json();
}).then((res) => {
  if (res)console.debug({ res });
});
