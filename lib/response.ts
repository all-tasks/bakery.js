import statuses from 'statuses';

import cookie from 'cookie';

interface ResCookie {
  set: (key: string, value: string, options) => void;
  append: (key: string, value: string, options) => void;
  [key: string]: any;
}

export interface ResProps {
  // status related
  status: number;
  message: string;
  statusText: string; // alias for message

  // headers related
  headers: Headers;
  headersObject: Record<string, string>;
  type: string;

  // cookie related
  cookie: ResCookie;
  cookies: string[];

  // body related
  body: any;
  bodyString: string;
}

export type Res = (() => Response) & ResProps;

const aliases = {
  statusText: 'message',
};

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
    if (
      typeof value !== 'object' ||
      Object.values(value).some((v) => !['number', 'string'].includes(typeof v))
    ) {
      throw new Error('invalid headers');
    }
  },
  type(value) {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error('invalid type');
    }
  },
  all(value) {
    Object.entries(value).forEach(([key, val]) =>
      this[key] ? this[key](val) : console.warn(`${key} validator not found`),
    );
  },
};

function checkBodyType(value) {
  return typeof value === 'object'
    ? ['[object Array]', '[object Object]'].includes(Object.prototype.toString.call(value))
      ? 'application/json'
      : value instanceof FormData
        ? 'multipart/form-data'
        : value instanceof URLSearchParams
          ? 'application/x-www-form-urlencoded'
          : value instanceof Blob
            ? value.type || 'application/octet-stream'
            : value instanceof ArrayBuffer ||
                (typeof Buffer !== 'undefined' && Buffer.isBuffer(value))
              ? 'application/octet-stream'
              : undefined
    : typeof value === 'string' && /<html|<!DOCTYPE HTML/i.test(value)
      ? 'text/html'
      : /^\s*<\?xml/.test(value)
        ? 'application/xml'
        : ['boolean', 'number', 'string'].includes(typeof value)
          ? 'text/plain'
          : undefined;
}

function getCookiesValue(cookies, key) {
  const cookieValue = cookies.map((c) => c.split(';')[0].split('=')).filter((c) => c[0] === key);
  return cookieValue.length === 0
    ? undefined
    : cookieValue.length === 1
      ? cookieValue[0][1]
      : cookieValue.map((c) => c[1]);
}

function createResponse({
  status = 400,
  message = `${statuses(400)}`,
  headers = {},
  type,
  body,
}: {
  status?: number;
  message?: string;
  headers?: Headers | Record<string, string>;
  type?: string;
  body?: any;
} = {}): Res {
  validateArgument.all({
    status,
    message,
    headers,
    type,
  });

  headers = headers instanceof Headers ? headers : new Headers(headers);

  if (type) {
    headers.set('Content-Type', type);
  }

  return new Proxy(() => {}, {
    get(target: any, property) {
      property = aliases[property] || property;

      switch (property) {
        case 'status': {
          return (target.status ||= status);
        }
        case 'message': {
          return (target.message ||= message);
        }
        case 'header': {
          return new Proxy(
            {},
            {
              get(_, key) {
                return (target.headers ||= headers).get(key);
              },
              set(_, key, value) {
                (target.headers ||= headers).set(key, value);
                return true;
              },
            },
          );
        }
        case 'headers': {
          return (target.headers ||= headers);
        }
        case 'headersObject': {
          return Object.fromEntries((target.headers ||= headers));
        }
        case 'type': {
          return (target.headers ||= headers).get('Content-Type');
        }
        case 'cookie': {
          return new Proxy(
            {},
            {
              get(_, key) {
                const cookies = (target.headers ||= headers).getSetCookie();

                switch (key) {
                  case 'get': {
                    return (k) => getCookiesValue(cookies, k);
                  }
                  case 'set': {
                    return (k, v, o) => {
                      (target.headers ||= headers).set('Set-Cookie', cookie.serialize(k, v, o));
                    };
                  }
                  case 'append': {
                    return (k, v, o) => {
                      (target.headers ||= headers).append('Set-Cookie', cookie.serialize(k, v, o));
                    };
                  }
                  default: {
                    return getCookiesValue(cookies, key);
                  }
                }
              },
              set(_, key: string, value) {
                (target.headers ||= headers).append('Set-Cookie', cookie.serialize(key, value));
                return true;
              },
            },
          );
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
      property = aliases[property] || property;

      switch (property) {
        case 'status': {
          validateArgument.status(value);
          if (!target.message || target.message === statuses(target.status || status)) {
            // check if the message is unset or default, then update it.
            target.message = statuses(value);
          }
          if (statuses.empty[value] && target.body !== undefined) {
            // check if the status code for empty body, then warning.
            console.warn('body not allowed for this status code');
            // target.body = undefined;
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

          target.status ||= 200;
          target.message ||= statuses(200);

          target.headers || (target.headers ??= headers).set('Content-Type', type);

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

    apply(target: any): Response {
      return new Response(target.body, {
        status: target.status || status,
        statusText: target.message || message,
        headers: target.headers || headers,
      });
    },
  }) as Res;
}

export default createResponse;

export { createResponse };
