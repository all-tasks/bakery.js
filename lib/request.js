/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

const aliases = {
  path: 'pathname',
};

const urlProperties = ['href', 'origin', 'protocol', 'username', 'password', 'host', 'hostname', 'port', 'pathname', 'hash', 'search', 'searchParams'];

function getQuery(searchParams) {
  const query = Object.fromEntries(searchParams);

  const keys = Array.from(searchParams.keys());

  let unique = new Set(keys);

  if (unique.size !== keys.length) {
    unique = new Set();
    keys.forEach((key) => {
      if (Array.isArray(query[key])) { return; }
      if (unique.size === unique.add(key).size) {
        query[key] = searchParams.getAll(key);
      }
    });
  }

  return query;
}

function createRequest(req) {
  // TODO: validateArgument

  return new Proxy(() => {}, {
    get(target, property) {
      property = aliases[property] || property;

      if (urlProperties.includes(property)) {
        return (target.URL ||= new URL(req.url))[property];
      }

      switch (property) {
        case 'URL':
          return target.URL ||= new URL(req.url);

        case 'query':
          return target.query ||= getQuery((target.URL ||= new URL(req.url)).searchParams);

        case 'type':
          return target.type ||= req.headers.get('content-type');

        default:
          return target[property] || req[property];
      }
    },

    set(target, property, value) {
      if (Object.hasOwn(target, property) || Object.hasOwn(req, property)) {
        throw new Error(`cannot reassign request property [${property}]`);
      }
      return target[property] = value;
    },
  });
}

export default createRequest;

export {
  createRequest,
};
