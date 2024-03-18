import { createRequest } from './request.js';

import { createResponse } from './response.js';

function createContext({
  req,
} = {}) {
  return {
    req,
    request: createRequest(req),
    response: createResponse(),
  };
}

export default createContext;

export {
  createContext,
};
