#!/usr/bin/env bun

import { $, file } from 'bun';

import Bakery from '#bakery';

const port = 6004;

const bakery = new Bakery({
  port,
});

const indexHtml = await (await file(`${import.meta.dir}/index.html`))?.text();

const clients = new Set();

bakery.addSteps(
  async function logger() {
    this.logger = console;
    console.info(`request "${this.request.method}:${this.request.path}"`);
    await this.steps.next();
    console.info(`response "${this.request.method}:${this.request.path}"`);
  },
  async function index() {
    const routePath = `${this.request.method}:${this.request.path}`;
    switch (routePath) {
      case 'GET:/favicon.ico': {
        this.response.status = 404;
        return;
      }
      case 'GET:/sse': {
        await this.steps.next();
        return;
      }
      case 'POST:/message': {
        const message = await this.request.body;

        console.log('message', JSON.stringify(message));

        [...clients].forEach((receiver) => {
          receiver.enqueue(`data: ${JSON.stringify({ time: new Date().getTime(), message })}\n\n`);
        });
        this.response.status = 204;
        return;
      }
      default: {
        this.response.body = indexHtml;
      }
    }
  },
  async function sse() {
    this.response.headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };
    this.response.body = new ReadableStream({
      start(controller) {
        clients.add(controller);

        controller.enqueue(`data: ${JSON.stringify({
          time: new Date().getTime(),
          message: 'Welcome to bakery.js!',
        })}\n\n`);

        // const sendEvent = (data) => {
        //   controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        // };

        // const intervalId = setInterval(() => {
        //   sendEvent({ time: new Date().getTime() });
        // }, 1000);

        // return () => {
        //   clearInterval(intervalId);
        // };
      },
    });
    await this.steps.next();
  },
);

await $`open http://localhost:${port}`;
