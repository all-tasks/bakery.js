#!/usr/bin/env bun

import { serve } from 'bun';

import { createContext } from './context.js';
import request from './request.js';
import response from './response.js';
import { runSteps } from './steps.js';

class Bakery extends EventTarget {
  #event = new EventTarget();

  #serve;

  #steps = [];

  constructor(options = {}) {
    super();
    const bakery = this;
    this.#serve = serve({
      ...options,
      async fetch(req) {
        console.log('fetch', req);
        const url = new URL(req.url);
        console.log('url', url);
        bakery.dispatchEvent(new Event('request'));
        const context = createContext({
          ...request(req),
          ...response(),
        });
        await runSteps(bakery.#steps, context);

        return response();
      },
      // async error(error) {
      //   return new Response();
      // },
    });

    Object.defineProperties(this, {
      event: {
        enumerable: true,
        readonly: true,
        value: this.#event,
      },
    });
  }

  // add(...steps) {

  // }

  // on(event, handler) {

  // }
}

const bakery = new Bakery({
  port: 6000,
});

// bakery.addEventListener('request', (event) => {
//   console.log('request', event);
// });

fetch('http://localhost:6000/users?role=admin').then((res) => res.text()).then(console.log);
