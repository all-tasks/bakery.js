/* eslint-disable no-param-reassign */

import statuses from 'statuses';

function createResponse({
  status = 400,
  message = statuses(400),
  headers = {},
  type = 'application/json',
  body,
} = {}) {
  const response = {
    status,
    message,
    headers,
    type,
    body,
  };

  return new Proxy(() => {}, {
    get(target, property) {
      return target[property] || response[property];
    },
    set(target, property, value) {
      switch (property) {
        case 'status':
          if (!Number.isInteger(value) || value < 100 || value > 599) {
            throw new Error('invalid status code');
          }
          if (target.message === statuses(target.status || response.status)) {
            target.message = statuses(value);
          }
          if (statuses.empty[value] && target.body !== undefined) {
            console.warn('body not allowed for this status code');
            target.body = undefined;
          }
          target.status = value;
          break;
        case 'message':
          if (typeof value !== 'string') {
            throw new Error('invalid status message');
          }
          target.message = value;
          break;
        case 'headers':
          if (typeof value !== 'object'
          || Object.values(value).some((v) => !['number', 'string'].includes(typeof v))) {
            throw new Error('invalid headers');
          }
          target.headers = value;
          break;
        // case 'type':
        //   if (typeof value !== 'string') {
        //     throw new Error('invalid status message');
        //   }
        //   // TODO
        //   response.type = value;
        //   break;
        case 'body':
          if (statuses.empty[target.status || response.status]) {
            throw new Error('body not allowed for this status code');
          }
          // TODO: update response.type based on body
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
            'Content-Type': target.type || response.type,
          },
        },
      );
    },
  });
}

export default createResponse;
