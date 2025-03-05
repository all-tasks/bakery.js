import validateArgument from './validateArgument.js';

import Route from './Route.js';

import { type Step } from '#lib/types';

class Node {
  #segment: string;

  #params: Set<string>;

  #steps: Step[] = [];

  #nodes: Record<string, Node> = {};

  #routes: Record<string, Route> = {};

  constructor(segment: string, ...steps: Step[]) {
    validateArgument.all({ segment, steps });

    const param = segment.match(/^:([\w-.]+)$/)?.[1];

    this.#segment = param === undefined ? segment : ':param';

    this.#params = new Set(param === undefined ? [] : [param]);

    if (steps.length) this.#steps.push(...steps);

    Object.defineProperties(this, {
      segment: {
        enumerable: true,
        writable: false,
        value: this.#segment,
      },
      params: {
        enumerable: true,
        get: () => Object.freeze([...this.#params]),
      },
      steps: {
        enumerable: true,
        get: () => Object.freeze([...this.#steps]),
      },
      nodes: {
        enumerable: true,
        get: () => Object.freeze({ ...this.#nodes }),
      },
      routes: {
        enumerable: true,
        get: () => Object.freeze({ ...this.#routes }),
      },
    });
  }

  readonly segment: string;
  readonly params: string[];
  readonly steps: Step[];
  readonly nodes: Record<string, Node>;
  readonly routes: Record<string, Route>;

  addParams(...params: string[]): Node {
    if (params.length === 0) {
      console.warn('no params to add');
      return this;
    }

    params.forEach((param) => {
      if (typeof param === 'string' && param.match(/^:?([\w-.]+)$/)?.[1]) {
        this.#params.add(param.slice(1));
      } else {
        throw new TypeError('param must be string and match /^:?([\\w-.]+)$/ pattern');
      }
    });

    return this;
  }

  addSteps(...steps: Step[]): Node {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    validateArgument.steps(steps);

    this.#steps.push(...steps);

    return this;
  }

  addNode(segment: string, ...steps: Step[]): Node {
    if (this.#segment === '*') {
      throw new Error('wildcard node cannot have sub-nodes');
    }

    // validate argument in new Node

    const newNode = new Node(segment, ...steps);

    segment = newNode.segment;

    if (this.#nodes[segment] === undefined) {
      this.#nodes[segment] = newNode;

      return newNode;
    }

    if (newNode.params.length) {
      this.#nodes[segment].addParams(...newNode.params);
    }

    if (steps.length) {
      this.#nodes[segment].addSteps(...steps);
    }

    return this.#nodes[segment];
  }

  mergeNode(scion: Node): Node {
    if (!(scion instanceof Node)) {
      throw new TypeError('scion must be an instance of Node');
    }
    try {
      if (scion.params.length) this.addParams(...scion.params);

      if (scion.steps.length) this.addSteps(...scion.steps);

      Object.entries(scion.nodes).forEach(([segment, node]) => {
        if (this.nodes[segment] === undefined) {
          this.#nodes[segment] = node;
        } else {
          this.nodes[segment].mergeNode(node);
        }
      });

      Object.entries(scion.routes).forEach(([method, route]) => {
        if (this.routes[method] === undefined) {
          this.#routes[method] = route;
        } else {
          console.warn(
            `method [${method}] already exists in node [${this.segment}], merging method will be ignored`,
          );
        }
      });
    } catch (error) {
      console.error(`mergeNode error: ${error.message}`);
      throw error;
    }

    return this;
  }

  addRoute(method: string, path: string, ...steps: Step[]): Route {
    // validate argument in new Route

    method = method.toUpperCase();

    if (this.#routes[method] !== undefined) {
      throw new Error(`method [${method}] already exists`);
    }

    this.#routes[method] = new Route(method, path, ...steps);

    return this.#routes[method];
  }

  toString(replacer?, space?: number): string {
    return JSON.stringify(this, replacer, space);
  }
}

export default Node;
