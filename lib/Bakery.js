import { serve } from 'bun';

class Bakery {
  constructor(options) {
    this.processes = [];

    this.serve = serve({
      ...options,
      async fetch(request) {
        return new Response();
      },
      async error(error) {
        return new Response();
      },
    });
  }

  use(...processes) {

  }

  on(event, handler) {

  }
}
