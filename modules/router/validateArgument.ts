import http from 'node:http';

const validMethods = http.METHODS || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const validateArgument = {
  method(value) {
    if (typeof value !== 'string' || !value.match(/^[A-Z-]+$/)) {
      throw new TypeError('method must be an uppercase string, like "GET" or "POST"');
    }
    if (!validMethods.includes(value)) {
      console.warn(`method "${value}" is not a valid HTTP method`);
    }
  },
  status(value) {
    if (typeof value !== 'number' || value < 100 || value > 599) {
      throw new TypeError('status must be a number between 100 and 599');
    }
  },
  // path(value) {
  //   if (typeof value !== 'string' || !value.match(/^[\w*-./:]*$/)) {
  //     throw new TypeError('path must be a string, like "/api/resources/:id"');
  //   }
  // },
  routePath(value) {
    if (typeof value !== 'string' || !value.match(/^[A-Z-]+:\/[\w*-./:]*$/)) {
      throw new TypeError('routePath must be a string, like "GET:/api/resources/:id"');
    }
  },
  segment(value) {
    if (typeof value !== 'string' || !value.match(/^(?:\*|:?[\w-.]+)$/)) {
      throw new TypeError('segment must be a string, like "resources" or ":id"');
    }
  },
  steps(value) {
    if (!Array.isArray(value) || value.some((step) => typeof step !== 'function')) {
      throw new TypeError('steps must be an array of functions');
    }
  },
  prefix(value) {
    if (typeof value !== 'string' || !value.match(/^[\w-./:]*$/)) {
      throw new TypeError('prefix must be a string, like "/api"');
    }
  },
  methodSteps(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new TypeError('methodSteps must be an object');
    }
    Object.entries(value).forEach(([key, val]) => {
      this.method(key);
      this.steps(val);
    });
  },

  all(value) {
    Object.entries(value).forEach(([key, val]) => (this[key] ? this[key](val) : console.warn(`${key} validator not found`)));
  },
};

export default validateArgument;
