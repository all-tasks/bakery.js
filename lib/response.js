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
          if (value === undefined || value === null) {
            if (!statuses.empty[target.status || response.status]) {
              console.warn('current status code require body');
            }
            target.body = null;
            break;
          }

          if (statuses.empty[target.status || response.status]) {
            console.warn('body not allowed for this status code');
          }

          if (['boolean', 'number', 'string'].includes(typeof value)) {
            target.body = value;
            target.type ||= 'text/plain';
            break;
          }

          if (value instanceof Blob) {
            target.body = value;
            target.type ||= value.type;
            break;
          } else if (value instanceof FormData) {
            target.body = value;
            target.type ||= 'multipart/form-data';
            break;
          } else if (value instanceof URLSearchParams) {
            target.body = value;
            target.type ||= 'application/x-www-form-urlencoded';
            break;
          } else if (typeof value === 'object') {
            target.originalBody = value;
            target.body = JSON.stringify(value);
            target.type ||= 'application/json';
            break;
          }

          throw new Error('invalid body type');

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
            'Content-Type': target.type || response.type,
          },
        },
      );
    },
  });
}

export default createResponse;
