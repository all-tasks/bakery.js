/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

import glob from 'fast-glob';
import Path from 'node:path';

import validateArgument from './validateArgument.js';

import Node from './Node.js';
import Route from './Route.js';

class Router {
  #prefix;

  #routeTree;

  #currentNode;

  #methodSteps;

  #statusSteps;

  constructor({
    prefix = '',
    methodSteps = {},
    statusSteps = {},
  } = {}) {
    validateArgument.all({ prefix, methodSteps });

    this.#prefix = prefix;

    this.#routeTree = new Node('root');

    this.#currentNode = this.#routeTree;

    this.#prefix.split('/').filter((segment) => (segment)).forEach((segment) => {
      this.#currentNode = this.#currentNode.addNode(segment);
    });

    this.#methodSteps = methodSteps;

    this.#statusSteps = {};

    const router = this;

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
      addRoute: {
        writable: false,
        value: this.route.bind(router),
      },
    });
  }

  addGlobalSteps(...steps) {
    this.#routeTree.addSteps(...steps);

    return this;
  }

  addMethodSteps(method, ...steps) {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    method = method.toUpperCase();

    validateArgument.all({ method, steps });

    (this.#methodSteps[method] ||= []).push(...steps);

    return this;
  }

  addStatusSteps(status, ...steps) {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    validateArgument.all({ status, steps });

    (this.#statusSteps[status] ||= []).push(...steps);

    return this;
  }

  route(routePath, ...steps) {
    validateArgument.steps(steps);

    const { method, segments } = Route.parseRoutePath(routePath);

    const reinstatePath = `${method}:/${[this.#prefix, ...segments].join('/')}`.replace(/\/\//g, '/');

    let { currentNode } = this;

    segments.forEach((segment) => {
      currentNode = currentNode.addNode(segment);
    });

    const route = currentNode.addRoute(method, reinstatePath, ...steps);

    return route;
  }

  batch(routes) {
    if (!Array.isArray(routes) || routes.some((route) => !Array.isArray(route))) {
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

    this.routeTree.mergeNode(router.routeTree);

    return this;
  }

  async globMerge(globPath) {
    if (typeof globPath !== 'string' || !globPath) {
      throw new TypeError('argument globPath must be a non-empty string');
    }
    try {
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
    } catch (error) {
      console.error(`globMerge error: ${error.message}`);
      throw error;
    }
  }

  routing() {
    const { routeTree, methodSteps } = this;

    return async function routing() {
      try {
        let currentNode = routeTree;

        const { method, path } = this.request;

        const params = {};

        const steps = [...currentNode.steps];

        const segments = path.split('/').filter((segment) => (segment));

        for (const segment of segments) {
          currentNode = currentNode.nodes[segment] || currentNode.nodes[':param'];

          if (currentNode === undefined) { break; }

          steps.push(...currentNode.steps);

          if (currentNode.params) {
            currentNode.params.forEach((param) => {
              if (params[param] !== undefined) {
                console.warn(`param ${param} already exists, will be overwritten`);
              }
              params[param] = segment;
            });
          }
        }

        if (currentNode === undefined || !Object.keys(currentNode.routes).length) {
          this.response.status = 404;
          return this.steps.next();
        }

        const matchedRoute = currentNode.routes[method];

        if (matchedRoute === undefined) {
          this.response.status = 405;
          return this.steps.next();
        }

        this.response.status = 200;

        this.route = matchedRoute.proxy;

        this.request.params = Object.freeze({ ...params });

        this.steps.after(
          ...steps,
          ...(methodSteps[method] || []),
          ...matchedRoute.steps,
        );

        return this.steps.next();
      } catch (error) {
        console.error(`routing error: ${error.message}`);
        throw error;
      }
    };
  }

  getAllRoutes(format = 'array') {
    if (format !== 'array' && format !== 'object') {
      throw new TypeError('argument format must be "array" or "object"');
    }

    const nodes = [{ path: '', node: this.routeTree }];
    let routes = [];

    while (nodes.length) {
      const { path, node } = nodes.shift();

      Object.entries(node.nodes).forEach(([segment, childNode]) => {
        nodes.push({ path: `${path}/${segment}`, node: childNode });
      });

      // eslint-disable-next-line no-loop-func
      Object.values(node.routes).forEach((route) => {
        routes.push({ path, route });
      });
    }

    routes = routes.sort((a, b) => {
      const result = a.path.replace(':', 'Ѐ').localeCompare(b.path.replace(':', 'Ѐ'));
      return result !== 0 ? result : (() => {
        const methods = ['DELETE', 'PATCH', 'PUT', 'GET', 'POST'];
        return methods.findIndex((method) => (method === b.route.method))
       - methods.findIndex((method) => (method === a.route.method));
      })();
    });

    return format === 'array'
      ? routes.map(({ route }) => (route))
      : Object.fromEntries(routes.map(({ route }) => ([route.path, route])));
  }

  toString(replacer, space) {
    return JSON.stringify(this, replacer, space);
  }
}

const factoryMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

factoryMethods.forEach((method) => {
  // eslint-disable-next-line
  Router.prototype[method] = Router.prototype[method.toLowerCase()] = function factoryMethod(path, ...steps) {
    validateArgument.all({ path, steps });
    this.route(`${method}:${path}`, ...steps);
    return this;
  };
});

export default Router;
