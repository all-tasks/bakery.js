/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import Node from './Node.js';

import {
  matchParam,
  margeNode,
} from './utils.js';

// const validCharactersInURI = /^[a-zA-Z0-9!#$%&'()*+,-./:;=?@_~]*$/;
const validCharactersInPath = /^[a-zA-Z0-9-_/:]*$/;
// const validCharactersInMethod = /^[a-zA-Z]+$/;

const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

class Router {
  constructor(options) {
    const { prefix } = options || {
      prefix: '',
    };

    this.routeTree = new Node('root');

    this.currentNode = this.routeTree;

    // validate argument prefix
    if (typeof prefix !== 'string' || !validCharactersInPath.test(prefix)) {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    this.prefix = prefix;

    this.prefix.split('/').filter((segment) => (segment !== '')).forEach((segment) => {
      this.currentNode = this.currentNode.addNode(segment);
    });

    this.processes = [];
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
    const segments = path.split('/').filter((segment) => (segment !== ''));

    // match and validate method
    const method = segments.shift().match(/^(?<method>[a-z]+):$/i)?.groups.method.toUpperCase();

    const reinstatePath = `${method}:/${this.prefix}/${segments.join('/')}`.replace(/\/\//g, '/');

    if (!method) {
      throw new Error(`Missing Method: "${path}"`);
    }

    if (!validMethods.includes(method)) {
      console.warn(`Not Valid Method: "${method}"`);
    }

    let { currentNode } = this;

    segments.forEach((segment) => {
      const param = matchParam(segment);

      const key = param === undefined ? segment : ':param';

      if (currentNode[key] === undefined){
        currentNode.addNode(segment)
      } else if (param){
        currentNode[key]._params.push(param);
      }

      currentNode = currentNode[key]
    });

    if (currentNode[method] === undefined) {
      currentNode.addRoute(method, reinstatePath, ...processes);
    } else {
      console.warn(`Duplicate Route Method: "${reinstatePath}". Will Add Processes To Current Route Method`);
      currentNode[method].addProcesses(...processes);
    }

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
  routing(path) {

  }

  toString() {
    return JSON.stringify(this.routeTree, null, 2);
  }
}

export default Router;
