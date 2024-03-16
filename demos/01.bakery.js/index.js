#!/usr/bin/env bun

import Bakery from '#bakery';

const bakery = new Bakery({
  port: 6000,
});

bakery.addSteps(
  async function logger() {
    this.logger = console;
    console.info(`request "${this.request.method}:${this.request.url}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.url}"`);
  },
  async function welcome() {
    this.response.body = 'Welcome to bakery.js!';
    this.steps.after(async function afterWelcome() {
      this.response.body += ' Hope you enjoy it!';
      this.steps.next();
    });
    this.steps.next();
    this.response.body += ' And have a wonderful day!';
  },
);

fetch('http://localhost:6000/users?role=admin')
  .then((res) => {
    console.debug(res);
    return res.text();
  }).then((res) => {
    console.debug(`fetch: ${res}`);
  });
