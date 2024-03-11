import request from './request.js';

import response from './response.js';

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
    request: request(req),
    response: response(),
  };
}

export default createContext;

export {
  createContext,
};
