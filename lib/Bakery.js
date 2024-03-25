#!/usr/bin/env bun

import { serve } from 'bun';

import { createContext } from './context.js';

import { runSteps } from './steps.js';

class Bakery extends EventTarget {
  #serve;

  #steps = [];

  constructor(options = {}) {
    super();
    const bakery = this;
    this.#serve = serve({
      ...options,
      async fetch(req) {
        try {
          const context = createContext({ req });
          await runSteps([...bakery.#steps], context);
          return context.response();
        } catch (error) {
          console.error(error);
          return new Response(null, {
            status: 500,
          });
        }
      },
    });

    this.add = this.addSteps.bind(this);
  }

  addSteps(...steps) {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    if (!Array.isArray(steps) || steps.some((step) => typeof step !== 'function')) {
      throw new TypeError('steps must be an array of functions');
    }

    this.#steps.push(...steps);

    return this;
  }
}

export default Bakery;
