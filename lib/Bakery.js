#!/usr/bin/env bun

import { serve } from 'bun';

import { createContext } from './context.js';

import { runSteps } from './steps.js';

class Bakery extends EventTarget {
  #serve;

  #steps = [];

  constructor(options = {}) {
    // TODO: validateArgument

    super();
    const bakery = this;
    this.#serve = serve({
      ...options,
      async fetch(req) {
        const context = createContext({ req });
        await runSteps([...bakery.#steps], context);
        return context.response();
      },
    });

    this.add = this.addSteps.bind(this);
  }

  addSteps(...steps) {
    // TODO: validateArgument

    this.#steps.push(...steps);
  }
}

export default Bakery;
