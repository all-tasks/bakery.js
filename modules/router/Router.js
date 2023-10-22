function grafting(stock, scion) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in scion) {
    if (stock[key] === undefined) {
      // eslint-disable-next-line no-param-reassign
      stock[key] = scion[key];
    } else if (stock[key].method === key && scion[key].method === key) {
      // TODO: Looking for better solution
      stock[key].controllers.push(...scion[key].controllers);
    } else if (stock[key].method !== key && scion[key].method !== key) {
      grafting(stock[key], scion[key]);
    } else {
      throw new Error(`Invalid Grafting: ${stock} ${scion}`);
    }
  }
}

const validCharactersInURI = /^[a-zA-Z0-9!#$%&'()*+,-./:;=?@_~]*$/;
const validCharactersInPath = /^[a-zA-Z0-9-_/:]*$/;
const validCharactersInMethod = /^[a-zA-Z]+$/;

const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

class Router {
  constructor(options) {
    const { prefix } = options || {
      prefix: '',
    };

    // validate argument prefix
    if (typeof prefix !== 'string' || !validCharactersInPath.test(prefix)) {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    this.routeTree = {};

    this.currentBranch = this.routeTree;

    this.prefix = prefix || '';

    this.prefix.split('/').filter((segment) => (segment !== '')).forEach((segment) => {
      if (this.currentBranch[segment] === undefined) this.currentBranch[segment] = {};
      this.currentBranch = this.currentBranch[segment];
    });

    this.middleware = [];
  }

  // add route to route tree
  route(path, ...functions) {
    // validate argument path
    if (typeof path !== 'string' || path === '' || !validCharactersInPath.test(path)) {
      throw new Error(`Invalid Path: ${path} ${typeof path}`);
    }

    // validate argument functions
    if (functions.length === 0 || functions.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Function');
    }

    // split path into segments
    const segments = path.split('/').filter((segment) => (segment !== ''));

    // match and validate method
    const method = segments.shift().match(/^(?<method>[a-z]+):$/i)?.groups.method.toUpperCase();

    const reinstatePath = segments.join('/');

    if (!method) {
      throw new Error(`Invalid Method: ${path}`);
    }

    if (!validMethods.includes(method)) {
      console.warn(`Not Valid Method: ${method}`);
    }

    // add branch to route tree
    let branch = this.currentBranch;

    segments.forEach((segment) => {
      if (segment.match(/^:.+$/)) {
        if (branch[':param'] === undefined) {
          branch[':param'] = { param: [segment] };
        } else {
          branch[':param'].param.push(segment);
        }
        branch = branch[':param'];
      } else {
        if (branch[segment] === undefined) branch[segment] = {};
        branch = branch[segment];
      }
    });

    if (branch[method] === undefined) {
      branch[method] = {
        method,
        path: `${method}:/${this.prefix}/${reinstatePath}`.replace(/\/\//g, '/'),
        controllers: functions,
      };
    } else {
      console.warn(`Route Already Exists: ${path}`);
      branch[method].push(functions);
    }

    return this;
  }

  // batch add routes to route tree
  batch(routes) {
    if (!Array.isArray(routes)) {
      throw new Error('Argument Routes Must Be An Array');
    }

    routes.forEach((route) => {
      this.route(route);
    });

    return this;
  }

  // graft other router to this router
  graft(router) {
    if (!(router instanceof Router)) {
      throw new Error('Invalid Router');
    }

    grafting(this.routeTree, router.routeTree);

    return this;
  }

  // add global middleware, will be executed before or after route functions
  middleware(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Invalid Function');
    }

    this.middleware.push(fn);

    return this;
  }

  // match request to route tree
  match(ctx, next) {

  }

  toString() {
    return JSON.stringify(this.routeTree, null, 2);
  }
}

export default Router;
