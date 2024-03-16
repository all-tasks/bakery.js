#!/usr/bin/env bun

import { serve } from 'bun';

import { createContext } from './context.js';

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
        const context = createContext({ req });

        await runSteps(bakery.#steps, context);

        return context.response();
      },
    });
    Object.defineProperties(this, {
      event: {
        enumerable: true,
        readonly: true,
        value: this.#event,
      },
    });
  }

  addSteps(...steps) {
    this.#steps.push(...steps);
  }
}

export default Bakery;
