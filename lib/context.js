import { createRequest } from './request.js';

import { createResponse } from './response.js';

function createContext({
  req,
} = {}) {
  return {
    req,
    request: createRequest(req),
    response: createResponse(),
    steps: {},
    throw(error) {
      throw error;
    },
    get next() {
      return this.steps.next;
    },
  };
}

export default createContext;

export {
  createContext,
};
