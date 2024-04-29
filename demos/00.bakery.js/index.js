#!/usr/bin/env bun

import Bakery from '#bakery';

const port = 6000;

const bakery = new Bakery({
  port,
});

// let willTriggerError = true;

bakery.addSteps(
  async function logger() {
    this.logger = console;
    console.info(`request "${this.request.method}:${this.request.path}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.path}"`);
  },
  async function welcome() {
    this.logger.info('---- welcome ----');
    this.response.body = 'Welcome to bakery.js!';
    this.steps.after(async function afterWelcome() {
      this.response.body += ' Hope you enjoy it';
      await this.next();
    });
    await this.steps.next();
    this.response.body += ' and have a wonderful day!';
  },
  // async () => {
  //   if (willTriggerError) throw new Error('error');
  // },
);

const host = `http://localhost:${port}`;

await fetch(`${host}/api/users?role=admin`)
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    if (res)console.debug(`fetch: ${res}`);
  });

// willTriggerError = false;

// await fetch('http://localhost:6000/users?role=admin')
//   .then((res) => {
//     console.debug(res);
//     return res.text();
//   }).then((res) => {
//     if (res)console.debug(`fetch: ${res}`);
//   });
