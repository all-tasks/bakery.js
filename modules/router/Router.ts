import glob from 'fast-glob';
import Path from 'node:path';

import validateArgument from './validateArgument.js';

import Node from './Node.js';
import Route from './Route.js';

import { type Step } from '#lib/types';

class Router {
  #prefix;

  #routeTree;

  #currentNode;

  #methodSteps: Record<string, Step[]> = {};

  #statusSteps: Record<number, Step[]> = {};

  constructor({ prefix = '', methodSteps = {}, statusSteps = {} } = {}) {
    validateArgument.all({ prefix, methodSteps });

    this.#prefix = prefix;

    this.#routeTree = new Node('root');

    this.#currentNode = this.#routeTree;

    this.#prefix
      .split('/')
      .filter((segment) => segment)
      .forEach((segment) => {
        this.#currentNode = this.#currentNode.addNode(segment);
      });

    this.#methodSteps = structuredClone(methodSteps);

    this.#statusSteps = structuredClone(statusSteps);

    this.#defineProperties();
  }

  #defineProperties() {
    const getterCache = new WeakMap();

    Object.defineProperties(this, {
      prefix: {
        enumerable: true,
        writable: false,
        value: this.#prefix,
      },
      routeTree: {
        enumerable: true,
        get() {
          return this.#routeTree;
        },
      },
      currentNode: {
        enumerable: true,
        writable: false,
        value: this.#currentNode,
      },
      methodSteps: {
        enumerable: true,
        get() {
          if (getterCache.has(this.#methodSteps)) {
            return getterCache.get(this.#methodSteps);
          }

          const result = Object.freeze(
            Object.fromEntries(
              Object.entries(this.#methodSteps).map(([key, value]) => [
                key,
                Object.freeze([...(value as Step[])]),
              ]),
            ),
          );

          getterCache.set(this.#methodSteps, result);
          return result;
        },
      },
      statusSteps: {
        enumerable: true,
        get() {
          if (getterCache.has(this.#statusSteps)) {
            return getterCache.get(this.#statusSteps);
          }

          const result = Object.freeze(
            Object.fromEntries(
              Object.entries(this.#statusSteps).map(([key, value]) => [
                key,
                Object.freeze([...(value as Step[])]),
              ]),
            ),
          );

          getterCache.set(this.#statusSteps, result);
          return result;
        },
      },
      addRoute: {
        writable: false,
        value: this.route.bind(this),
      },
    });
  }

  readonly prefix: string;
  readonly currentNode: Node;
  readonly routeTree: Node;
  readonly methodSteps: Record<string, ReadonlyArray<Step>>;
  readonly statusSteps: Record<number, ReadonlyArray<Step>>;

  addGlobalSteps(...steps: Step[]): Router {
    this.#routeTree.addSteps(...steps);

    return this;
  }

  addMethodSteps(method: string, ...steps: Step[]): Router {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    method = method.toUpperCase();

    validateArgument.all({ method, steps });

    (this.#methodSteps[method] ??= []).push(...steps);

    return this;
  }

  addStatusSteps(status: number, ...steps: Step[]): Router {
    try {
      if (typeof status === 'string') {
        status = parseInt(status, 10);
      }
      if (typeof status !== 'number' || status < 100 || status > 599) {
        throw new Error();
      }
    } catch (error) {
      throw new TypeError(
        'argument status must be a number or a string of number between 100 and 599',
      );
    }

    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    validateArgument.all({ status, steps });

    (this.#statusSteps[status] ??= []).push(...steps);

    return this;
  }

  route(routePath: string, ...steps: Step[]): Route {
    validateArgument.steps(steps);

    const { method, segments } = Route.parseRoutePath(routePath);

    const reinstatePath = `${method}:/${[this.#prefix, ...segments].join('/')}`.replace(
      /\/{2,}/g,
      '/',
    );

    let { currentNode } = this;

    segments.forEach((segment) => {
      currentNode = currentNode.addNode(segment);
    });

    const route = currentNode.addRoute(method, reinstatePath, ...steps);

    return route;
  }

  batch(routes: Array<[routePath: string, ...steps: Step[]]>): Router {
    if (!Array.isArray(routes) || routes.some((route) => !Array.isArray(route))) {
      throw new TypeError('argument routes must be an array of arrays (route arguments)');
    }

    routes.forEach((route) => {
      this.route(...route);
    });

    return this;
  }

  merge(router: Router): Router {
    if (!(router instanceof Router)) {
      throw new TypeError('argument router must be an instance of Router');
    }

    if (Object.keys(router.methodSteps).length) {
      console.warn('merge will ignore argument router\'s "methodSteps"');
    }

    this.routeTree.mergeNode(router.routeTree);

    return this;
  }

  async globMerge(globPath: string): Promise<Router> {
    if (typeof globPath !== 'string' || !globPath) {
      throw new TypeError('argument globPath must be a non-empty string');
    }
    try {
      const files = await glob(globPath);

      await Promise.all(
        files.map((file) =>
          import(Path.resolve(file))
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
            }),
        ),
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
        const { method, path } = this.request;

        const segments = path.split('/').filter(Boolean);

        const stack = [{ index: -1, node: routeTree, steps: routeTree.steps, params: {} }];

        let matchedNode, matchedRoute, matchedSteps, matchedParams;

        while (stack.length) {
          const current = stack.pop();
          if (current?.node === undefined) continue;
          const { index, node, steps, params } = current;

          let newIndex = index + 1;

          if (newIndex === segments.length) {
            matchedNode = node;
            matchedRoute = node.routes[method] || node.routes['ALL'];
            if (matchedRoute) {
              matchedSteps = steps.concat(methodSteps[method] || [], matchedRoute.steps);
              matchedParams = params;
              break;
            }
          } else {
            const wildcardNode = node.nodes['*']; // Wildcard Match
            const paramNode = node.nodes[':param']; // Parameter Match
            const segmentNode = node.nodes[segments[newIndex]]; // Exact Match

            // Priority : Exact Match > Parameter Match > Wildcard Match
            // lower priority first push to stack

            if (wildcardNode) {
              const wildcardParams = Object.assign({}, params);
              wildcardParams['*'] = segments.slice(newIndex).join('/');
              stack.push({
                index: segments.length - 1,
                node: wildcardNode,
                steps: steps.concat(wildcardNode.steps),
                params: wildcardParams,
              });
            }
            if (paramNode) {
              const newParams = Object.assign({}, params);
              paramNode.params.forEach((param) => {
                if (newParams[param] !== undefined) {
                  console.warn(`param ${param} already exists, will be overwritten`);
                }
                newParams[param] = segments[newIndex];
              });
              stack.push({
                index: newIndex,
                node: paramNode,
                steps: steps.concat(paramNode.steps),
                params: newParams,
              });
            }
            if (segmentNode) {
              stack.push({
                index: newIndex,
                node: segmentNode,
                steps: steps.concat(segmentNode.steps),
                params,
              });
            }
          }
        }

        if (!matchedNode) {
          this.response.status = 404;
          return this.steps.next();
        }

        if (!matchedRoute) {
          this.response.status = 405;
          return this.steps.next();
        }

        this.response.status = 200;

        this.route = matchedRoute.proxy;

        this.request.params = Object.freeze(matchedParams);

        this.steps.after(...matchedSteps);

        return this.steps.next();
      } catch (error) {
        console.error(`routing error: ${error.message}`);
        throw error;
      }
    };
  }

  getAllRoutes(format: 'array' | 'object' = 'array'): Route[] | Record<string, Route> {
    if (format !== 'array' && format !== 'object') {
      throw new TypeError('argument format must be "array" or "object"');
    }

    interface NodeItem {
      path: string;
      node: Node;
    }

    interface RouteItem {
      path: string;
      route: Route;
    }

    const nodes: NodeItem[] = [{ path: '', node: this.routeTree }];
    let routes: RouteItem[] = [];

    while (nodes.length) {
      const { path, node } = nodes.shift() as NodeItem;

      Object.entries(node.nodes).forEach(([segment, childNode]) => {
        nodes.push({ path: `${path}/${segment}`, node: childNode });
      });

      Object.values(node.routes).forEach((route) => {
        routes.push({ path, route });
      });
    }

    routes = routes.sort((a, b) => {
      const result = a.path.replace(':', 'Ѐ').localeCompare(b.path.replace(':', 'Ѐ'));
      return result !== 0
        ? result
        : (() => {
            const methods = ['DELETE', 'PATCH', 'PUT', 'GET', 'POST'];
            return (
              methods.findIndex((method) => method === b.route.method) -
              methods.findIndex((method) => method === a.route.method)
            );
          })();
    });

    return format === 'array'
      ? routes.map(({ route }) => route)
      : Object.fromEntries(routes.map(({ route }) => [route.path, route]));
  }

  toString(replacer?: any, space?: any) {
    return JSON.stringify(this, replacer, space);
  }
}

const factoryMethods = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

factoryMethods.forEach((method) => {
  Router.prototype[method] = Router.prototype[method.toLowerCase()] = function factoryMethod(
    path,
    ...steps
  ) {
    validateArgument.all({ path, steps });
    this.route(`${method}:${path}`, ...steps);
    return this;
  };
});

export default Router;
