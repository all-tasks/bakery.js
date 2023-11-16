/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

import Node from './Node.js';

import {
  validCharactersInPath,
  validCharactersInMethod,
  validMethods,
  margeNode,
} from './utils.js';

class Router {
  constructor(options) {
    const { prefix } = options || {
      prefix: '',
    };

    this.routeTree = new Node('root');
    this.currentNode = this.routeTree;

    // validate argument prefix
    if (typeof prefix !== 'string' || !validCharactersInPath.test(prefix)) {
      throw new Error(`Invalid prefix: "${prefix}"`);
    }

    this.prefix = prefix;

    this.prefix.split('/').filter((segment) => (segment)).forEach((segment) => {
      this.currentNode = this.currentNode.addNode(segment);
    });

    this.methodProcesses = {};
  }

  // add processes, which will be executed when starting routing
  addProcesses(...processes) {
    this.routeTree.addProcesses(...processes);
  }

  // add processes for all routes, which will be executed before routes processes
  addRouteProcesses(...processes) {
    this.routeTree.addRouteProcesses(...processes);
  }

  // add processes for methods, which will be executed before matching method routes processes
  addMethodProcesses(method, ...processes) {
    // validate argument method
    if (typeof method !== 'string' || !validCharactersInMethod.test(method)) {
      throw new Error(`Invalid Method: "${method}"`);
    }

    // validate argument processes
    if (processes.length === 0 || processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    const upperCasedMethod = method.toUpperCase();

    if (!validMethods.includes(upperCasedMethod)) {
      console.warn(`Not Valid Method: "${method}"`);
    }

    // validate argument processes
    if (processes.length === 0 || processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    if (this.methodProcesses[upperCasedMethod] === undefined) {
      this.methodProcesses[upperCasedMethod] = [];
    }

    this.methodProcesses[upperCasedMethod].push(...processes);
  }

  // add a route to route tree
  route(path, ...processes) {
    // validate argument path
    if (typeof path !== 'string' || path === '' || !validCharactersInPath.test(path)) {
      throw new Error(`Invalid Path: "${path}" "${typeof path}"`);
    }

    // validate argument handlers
    if (processes.length === 0 || processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Process');
    }

    // split path into segments
    const segments = path.split('/').filter((segment) => (segment));

    // match and validate method
    const method = segments?.shift()?.match(/^(?<method>[a-z]+):$/i)?.groups.method.toUpperCase();

    const reinstatePath = `${method}:/${this.prefix}/${segments.join('/')}`.replace(/\/\//g, '/');

    if (!method) {
      throw new Error(`Missing Method: "${path}"`);
    }

    let { currentNode } = this;

    segments.forEach((segment) => {
      currentNode = currentNode.addNode(segment);
    });

    currentNode.addRoute(method, reinstatePath, ...processes);

    return this;
  }

  // batch add routes to route tree
  batch(routes) {
    if (!Array.isArray(routes)) {
      throw new Error('Argument Routes Must Be An Array');
    }

    routes.forEach((route) => {
      this.route(...route);
    });

    return this;
  }

  // marge other router's routeTree to this router's routeTree
  marge(router) {
    if (!(router instanceof Router)) {
      throw new Error('Invalid Router');
    }

    margeNode(this.routeTree, router.routeTree);

    return this;
  }

  // routing a path to match a route
  routing({ method, path }) {
    // split url into segments
    const segments = path.split('/').filter((segment) => (segment));

    let currentNode = this.routeTree;

    const params = {};

    const processes = [...this.routeTree._processes];

    let matchedRoute;

    for (const segment of segments) {
      currentNode = currentNode[segment] || currentNode[':param'];

      if (currentNode === undefined) {
        matchedRoute = false;
        break;
      }

      if (currentNode._processes.length) {
        processes.push(...currentNode._processes);
      }

      if (currentNode._params.size) {
        currentNode._params.forEach((param) => {
          if (Object.hasOwnProperty.call(params, param)) {
            console.warn(`Param '${param}' Has Been Assigned Multiple Times`);
          }
          params[param] = segment;
        });
      }
    }

    if (matchedRoute === false) {
      if (this.errors?.[404]) this.errors[404]({ method, path });
      return undefined;
    }

    const upperCasedMethod = method.toUpperCase();

    matchedRoute = currentNode[upperCasedMethod];

    if (matchedRoute === undefined) {
      if (this.errors?.[405]) this.errors[405]({ method, path });
      return undefined;
    }

    if (this.methodProcesses[upperCasedMethod]) {
      processes.push(...this.methodProcesses[method]);
    }

    return {
      path: matchedRoute._path,
      params,
      processes: [...processes, ...matchedRoute._processes],
    };
  }

  toString() {
    return JSON.stringify(this.routeTree, null, 2);
  }
}

export default Router;
