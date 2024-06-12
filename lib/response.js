/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

import statuses from 'statuses';

import cookie from 'cookie';

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
    Object.entries(value).forEach(([key, val]) => (this[key] ? this[key](val) : console.warn(`${key} validator not found`)));
  },
};

function checkBodyType(value) {
  return typeof value === 'object' ? (
    ['[object Array]', '[object Object]'].includes(Object.prototype.toString.call(value)) ? 'application/json'
      : value instanceof FormData ? 'multipart/form-data'
        : value instanceof URLSearchParams ? 'application/x-www-form-urlencoded'
          : value instanceof Blob ? value.type : undefined
  ) : (
    typeof value === 'string' && /<!DOCTYPE HTML/i.test(value) ? 'text/html'
      : ['boolean', 'number', 'string'].includes(typeof value) ? 'text/plain'
        : undefined
  );
}

function createResponse({
  status = 400,
  message = statuses(400),
  headers = {},
  type,
  body,
} = {}) {
  validateArgument.all({
    status, message, headers, type,
  });

  headers = headers instanceof Headers ? headers : new Headers(headers);

  if (type) {
    headers.set('Content-Type', type);
  }

  return new Proxy(() => {}, {
    get(target, property) {
      switch (property) {
        case 'status': {
          return target.status ||= status;
        }
        case 'message': {
          return target.message ||= message;
        }
        case 'headers': {
          return target.headers ||= headers;
        }
        case 'headersObject': {
          return Object.fromEntries((target.headers ||= headers));
        }
        case 'type': {
          return (target.headers ||= headers).get('Content-Type');
        }
        case 'cookie': {
          return Object.freeze({
            get: (key) => {
              const cookies = (target.headers ||= headers).getSetCookie();
              return key ? cookies[key] : cookies;
            },
            set: (key, value, options) => {
              (target.headers ||= headers).append('Set-Cookie', cookie.serialize(key, value, options));
            },
          });
        }
        case 'cookies': {
          return (target.headers ||= headers).getSetCookie();
        }
        case 'body': {
          return target.originalBody || target.body || body;
        }
        case 'bodyString': {
          return target.body;
        }
        default: {
          return target[property];
        }
      }
    },

    set(target, property, value) {
      switch (property) {
        case 'status': {
          validateArgument.status(value);
          if (!target.message || target.message === statuses(target.status || status)) {
            target.message = statuses(value);
          }
          if (statuses.empty[value] && target.body !== undefined) {
            console.warn('body not allowed for this status code');
            target.body = undefined;
          }
          target.status = value;
          break;
        }
        case 'message': {
          validateArgument.message(value);
          target.message = value;
          break;
        }
        case 'headers': {
          validateArgument.headers(value);
          target.headers = value instanceof Headers ? value : new Headers(value);
          break;
        }
        case 'type': {
          validateArgument.type(value);
          (target.headers ||= headers).set('Content-Type', value);
          break;
        }
        case 'body': {
          if (statuses.empty[target.status || status]) {
            console.warn('body not allowed for this status code');
          }

          type = checkBodyType(value);

          console.debug({ status: target.status, message: target.message, type });

          target.status ||= 200;
          target.message ||= statuses(200);
          (target.headers ||= headers).set('Content-Type', type);

          setTimeout(() => {
            console.debug({ status: target.status, message: target.message, type });
          }, 100);

          console.debug({ status: target.status, message: target.message, type });

          if (type === 'application/json') {
            target.originalBody = value;
            target.body = JSON.stringify(value);

            break;
          }
          target.body = value;
          break;
        }
        default: {
          throw new Error('invalid response property');
        }
      }
      return value;
    },

    apply(target) {
      return new Response(
        target.body,
        {
          status: target.status || status,
          statusText: target.message || message,
          headers: target.headers || headers,
        },
      );
    },
  });
}

export default createResponse;

export {
  createResponse,
};
