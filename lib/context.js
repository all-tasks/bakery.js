import { createRequest } from './request.js';

import { createResponse } from './response.js';

// const context = {
//   request: {},
//   req: {},
//   response: {},
//   res: {},
//   processes: {},
//   logger: {},
//   error: {},
//   session: {},
//   permissions: {},
// };

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
