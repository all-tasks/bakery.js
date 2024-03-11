/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

const aliases = {
  path: 'pathname',
};

const urlProperties = ['href', 'origin', 'protocol', 'username', 'password', 'host', 'hostname', 'port', 'pathname', 'hash', 'search', 'searchParams'];

function getQuery(searchParams) {
  const query = Object.fromEntries(searchParams);

  const keys = searchParams.keys();

  const seed = new Set(keys);

  if (seed.size !== keys.length) {

  }

  return query;
}

function createRequest(req) {
  return new Proxy(() => {}, {
    get(target, property) {
      property = aliases[property] || property;

      if (urlProperties.includes(property)) {
        return (target.URL ||= new URL(req.url))[property];
      }

      if (property === 'URL') {
        return target.URL ||= new URL(req.url);
      }

      if (property === 'query') {
        return target.query ||= getQuery((target.URL ||= new URL(req.url)).searchParams);
      }

      return target[property] || req[property];
    },
    set(target, property, value) {
      console.log(target, property, value);
    },
  });
}

export default createRequest;

const req = {
  method: 'GET',
  url: 'http://localhost:6000/users?role=admin&array=1&array=2&array=3',
  headers: {
    connection: 'keep-alive',
    'user-agent': 'Bun/1.0.26',
    accept: '*/*',
    host: 'localhost:6000',
    'accept-encoding': 'gzip, deflate, br',
  },
};

createRequest(req);

const request = createRequest(req);

console.log(request.searchParams.keys());
