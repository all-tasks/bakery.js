import { createRequest } from './request.js';

import { createResponse } from './response.js';

function createContext({
  req,
} = {}) {
  return {
    req,
    request: createRequest(req),
    response: createResponse(),
    get next() {
      return this.steps.next;
    },
  };
}

export default createContext;

export {
  createContext,
};
