#!/usr/bin/env bun

import Bakery from '#bakery';

const bakery = new Bakery({
  port: 6000,
});

let willTriggerError = true;

bakery.addSteps(
  async function logger() {
    this.logger = console;
    console.info(`request "${this.request.method}:${this.request.url}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.url}"`);
  },
  async function welcome() {
    this.logger.info('---- welcome ----');
    this.response.body = 'Welcome to bakery.js!';
    this.steps.after(async function afterWelcome() {
      this.response.body += ' Hope you enjoy it';
      await this.steps.next();
    });
    await this.steps.next();
    this.response.body += ' Have a wonderful day!';
  },
  async () => {
    if (willTriggerError) throw new Error('error');
  },
);

await fetch('http://localhost:6000/users?role=admin')
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    if (res)console.debug(`fetch: ${res}`);
  });

willTriggerError = false;

await fetch('http://localhost:6000/users?role=admin')
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    if (res)console.debug(`fetch: ${res}`);
  });
