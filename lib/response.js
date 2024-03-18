/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */

import statuses from 'statuses';

const validateArgument = {
  status(value) {
    if (!Number.isInteger(value) || value < 100 || value > 599) {
      throw new Error('invalid status code');
    }
  },
  message(value) {
    if (typeof value !== 'string') {
      throw new Error('invalid status message');
    }
  },
  headers(value) {
    if (typeof value !== 'object'
    || Object.values(value).some((v) => !['number', 'string'].includes(typeof v))) {
      throw new Error('invalid headers');
    }
  },
  type(value) {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error('invalid type');
    }
  },
  all(value) {
    Object.entries(value).forEach(([key, val]) => {
      // eslint-disable-next-line no-unused-expressions
      this && this[key] && this[key](val);
    });
  },
};

function checkBodyType(value) {
  return value instanceof Blob ? value.type
    : value instanceof FormData ? 'multipart/form-data'
      : value instanceof URLSearchParams ? 'application/x-www-form-urlencoded'
        : ['boolean', 'number', 'string'].includes(typeof value) ? 'text/plain'
          : typeof value === 'object' ? 'application/json' : undefined;
}

function createResponse({
  status = 400,
  message = statuses(400),
  headers = {},
  type,
  body,
} = {}) {
  const response = {
    status,
    message,
    headers,
    type,
    body,
  };

  validateArgument.all(response);

  return new Proxy(() => {}, {
    get(target, property) {
      switch (property) {
        case 'body':
          return target.originalBody || target.body || response.body;
        case 'stringedBody':
          return target.body;
        default:
          return target[property] || response[property];
      }
    },

    set(target, property, value) {
      switch (property) {
        case 'status':
          validateArgument.status(value);
          if (!target.message || target.message === statuses(target.status || response.status)) {
            target.message = statuses(value);
          }
          if (statuses.empty[value] && target.body !== undefined) {
            console.warn('body not allowed for this status code');
            target.body = undefined;
          }
          target.status = value;
          break;

        case 'message':
          validateArgument.message(value);
          target.message = value;
          break;

        case 'headers':
          validateArgument.headers(value);
          target.headers = value;
          break;

        case 'type':
          validateArgument.type(value);
          response.type = value;
          break;

        case 'body':
          if (statuses.empty[target.status || response.status]) {
            console.warn('body not allowed for this status code');
          }

          type = checkBodyType(value);

          if (type === undefined) { throw new Error('invalid body type'); }

          target.status ||= 200;
          target.type ||= type;

          if (type === 'application/json') {
            target.originalBody = value;
            target.body = JSON.stringify(value);

            break;
          }

          target.body = value;

          break;

        default:
          throw new Error('invalid response property');
      }
      return value;
    },

    apply(target) {
      return new Response(
        target.body,
        {
          status: target.status || response.status,
          statusText: target.message || response.message,
          headers: {
            ...target.headers,
            ...target.type && { 'Content-Type': target.type },
          },
        },
      );
    },
  });
}

export default createResponse;

export {
  createResponse,
};
