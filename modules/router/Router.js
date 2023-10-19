class Router {
  constructor({ prefix }) {
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
    if (typeof path !== 'string' || path === '') {
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

    if (!method) {
      throw new Error(`Invalid Method: ${path}`);
    }

    // add branch to route tree
    let branch = this.currentBranch;

    segments.forEach((segment) => {
      if (branch[segment] === undefined) branch[segment] = {};
      branch = branch[segment];
    });

    if (branch[method] === undefined) branch[method] = [];
    branch[method].push(functions);
  }

  // batch add routes to route tree
  batch(routes) {
    routes.forEach((route) => {
      this.route(route);
    });
  }

  // graft other router to this router
  graft(router) {
    if (!(router instanceof Router)) throw new Error('Invalid Router');
  }

  // add middleware, will be executed before or after route functions
  middleware(fn) {
    if (typeof fn !== 'function') throw new Error('Invalid Function');
    this.middleware.push(fn);
  }

  // match request to route tree
  match(ctx, next) {

  }

  toString() {
    return JSON.stringify(this.routeTree, null, 2);
  }
}

export default Router;

const router = new Router({ prefix: '/api' });
