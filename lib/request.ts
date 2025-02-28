import cookie from 'cookie';

export type BodyType = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text';

export interface Req {
  readonly method: string;

  // URL related properties
  readonly URL: URL;
  readonly href: string;
  readonly origin: string;
  readonly protocol: string;
  readonly username: string;
  readonly password: string;
  readonly host: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly path: string; // alias for pathname
  readonly hash: string;
  readonly search: string;
  readonly searchParams: URLSearchParams;
  readonly query: Record<string, string | string[]>;

  // headers and type
  readonly type: string | null;
  readonly headers: Headers;

  // Cookie
  readonly cookie: Record<string, string>;
  readonly cookies: Record<string, string>; // alias for cookie

  // body processing
  body: <T = any>(type?: BodyType) => Promise<T | undefined>;

  // custom attributes
  [key: string]: any;
}

const aliases = {
  path: 'pathname',
  cookies: 'cookie',
};

const urlProperties = [
  'href',
  'origin',
  'protocol',
  'username',
  'password',
  'host',
  'hostname',
  'port',
  'pathname',
  'hash',
  'search',
  'searchParams',
];

interface Query {
  [key: string]: string | string[];
}

function getQuery(searchParams: URLSearchParams): Query {
  const query = {};

  for (const [key, value] of searchParams.entries()) {
    if (query[key] === undefined) {
      query[key] = value;
    } else if (typeof query[key] === 'string') {
      query[key] = searchParams.getAll(key);
    }
  }

  return query;
}

function checkBodyType(type) {
  return type.includes('json')
    ? 'json'
    : type.includes('text') || type.includes('xml')
      ? 'text'
      : type.includes('form-data')
        ? 'formData'
        : 'arrayBuffer';
}

function createRequest(req: Request): Req {
  return new Proxy(
    {},
    {
      get(target: any, property: string) {
        property = aliases[property] || property;

        if (urlProperties.includes(property)) {
          return (target.URL ||= new URL(req.url))[property];
        }

        switch (property) {
          case 'method': {
            return req.method.toUpperCase();
          }
          case 'URL': {
            return (target.URL ||= new URL(req.url));
          }
          case 'query': {
            return (target.query ||= getQuery((target.URL ||= new URL(req.url)).searchParams));
          }
          case 'type': {
            return (target.type ||= req.headers.get('content-type'));
          }
          case 'cookie': {
            return (target.cookie ||= cookie.parse(req.headers.get('cookie') || '') || {});
          }
          case 'body': {
            return async (
              reader = checkBodyType((target.type ||= req.headers.get('content-type'))),
            ) => {
              try {
                if (req.headers.get('content-length') === '0') {
                  return undefined;
                }
                if (!['arrayBuffer', 'blob', 'formData', 'json', 'text'].includes(reader)) {
                  throw new Error('invalid body reader');
                }
                target.body ||= {};
                return (target.body[reader] ||= await req[reader]());
              } catch (error) {
                console.error(error);
                return undefined;
              }
            };
          }
          default: {
            return target[property] || req[property];
          }
        }
      },

      set(target, property, value) {
        if (Object.hasOwn(target, property) || Object.hasOwn(req, property)) {
          throw new Error(`cannot reassign request property [${String(property)}]`);
        }
        return (target[property] = value);
      },
    },
  ) as Req;
}

export default createRequest;

export { createRequest };
