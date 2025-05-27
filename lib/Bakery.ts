#!/usr/bin/env bun

import { serve, type ServeOptions } from 'bun';

import { createContext } from './context.js';

import { runSteps } from './steps.js';

import type { BakeryOptions, Context, Step } from './types.js';

class Bakery extends EventTarget {
  #serve: ReturnType<typeof serve>;

  #steps: Step[] = [];

  constructor(options: BakeryOptions = {}) {
    super();

    const bakery = this;

    this.#serve = serve({
      ...options,
      async fetch(req: Request): Promise<Response> {
        let context: Context | undefined;
        try {
          context = createContext(req);
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

  addSteps(...steps: Step[]) {
    if (!Array.isArray(steps) || steps.some((step) => typeof step !== 'function')) {
      throw new TypeError('steps must be an array of functions');
    }

    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    this.#steps.push(...steps);

    return this;
  }

  add: typeof this.addSteps;
}

export default Bakery;
