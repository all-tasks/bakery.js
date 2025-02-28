import { createRequest, type Req } from './request.js';

import { createResponse, type Res } from './response.js';

import { Context } from './types.js';

function createContext(req: Request): Context {
  return {
    req,
    request: createRequest(req),
    response: createResponse(),
    throw(error) {
      throw error;
    },
    get next() {
      return this.steps.next;
    },
  } as Context;
}

export default createContext;

export { createContext };
