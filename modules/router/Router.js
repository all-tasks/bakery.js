/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

import glob from 'fast-glob';
import Path from 'node:path';

import Node from './Node.js';
import Route from './Route.js';

class Router {
  #prefix;

  #routeTree;

  #currentNode;

  #methodSteps;

  constructor({
    prefix = '',
    methodSteps = {},
  } = {}) {
    // TODO: validateArgument.prefix
    // TODO: validateArgument.methodSteps

    this.#prefix = prefix;

    this.#routeTree = new Node('root');

    this.#currentNode = this.#routeTree;

    this.#prefix.split('/').filter((segment) => (segment)).forEach((segment) => {
      this.#currentNode = this.#currentNode.addNode(segment);
    });

    this.#methodSteps = methodSteps;

    Object.defineProperties(this, {
      prefix: {
        enumerable: true,
        writable: false,
        value: this.#prefix,
      },
      routeTree: {
        enumerable: true,
        get() { return this.#routeTree; },
      },
      currentNode: {
        enumerable: true,
        writable: false,
        value: this.#currentNode,
      },
      methodSteps: {
        enumerable: true,
        get() {
          return Object.freeze(Object.fromEntries(Object.entries(this.#methodSteps)
            .map(([key, value]) => ([key, Object.freeze([...value])]))));
        },
      },
    });

    this.addRoute = this.route.bind(this);
  }

  addGlobalSteps(...steps) {
    // TODO: validateArgument.steps

    this.#routeTree.addSteps(...steps);

    return this;
  }

  addMethodSteps(method, ...steps) {
    method = method.toUpperCase();

    (this.#methodSteps[method] ||= []).push(...steps);

    return this;
  }

  route(path, ...steps) {
    // TODO: validateArgument.path
    // TODO: validateArgument.steps

    const { method, segments } = Route.parseRoutePath(path);

    const reinstatePath = `${method}:/${[this.#prefix, ...segments].join('/')}`.replace(/\/\//g, '/');

    let { currentNode } = this;

    segments.forEach((segment) => {
      currentNode = currentNode.addNode(segment);
    });

    const route = currentNode.addRoute(method, reinstatePath, ...steps);

    return route;
  }

  batch(routes) {
    if (!Array.isArray(routes) || !routes.every((route) => Array.isArray(route))) {
      throw new TypeError('argument routes must be an array of arrays (route arguments)');
    }

    routes.forEach((route) => {
      this.route(...route);
    });

    return this;
  }

  merge(router) {
    if (!(router instanceof Router)) {
      throw new TypeError('argument router must be an instance of Router');
    }

    if (Object.keys(router.methodSteps).length) {
      console.warn('merge will ignore argument router\'s "methodSteps"');
    }

    Node.margeNode(this.routeTree, router.routeTree);
  }

  async globMerge(globPath) {
    const files = await glob(globPath);
    await Promise.all(
      files.map((file) => import(Path.resolve(file))
        .then((module) => {
          const router = module?.default || module.router;

          if (router instanceof Router) {
            this.merge(router);
            return null;
          }
          console.warn(`merge ${file} error: should export a instance of Router`);
          return null;
        })
        .catch((error) => {
          console.warn(`merge ${file} error: ${error}`);
          return null;
        })),
    );
    return this;
  }
}

export default Router;
