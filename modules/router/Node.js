/* eslint-disable no-param-reassign */

import validateArgument from './validateArgument.js';

import Route from './Route.js';

class Node {
  #segment;

  #params;

  #steps;

  #nodes = {};

  #routes = {};

  constructor(segment, ...steps) {
    validateArgument.all({ segment, steps });

    const param = segment.match(/^:([\w-.]+)$/)?.[1];

    this.#segment = param === undefined ? segment : ':param';
    this.#params = new Set(param === undefined ? [] : [param]);
    this.#steps = steps;

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

  addParams(...params) {
    if (params.length === 0) {
      console.warn('no params to add');
      return this;
    }

    if (params.some((param) => typeof param !== 'string')) {
      throw new TypeError('param must be string');
    }

    this.#params = new Set([...this.#params, ...params]);

    return this;
  }

  addSteps(...steps) {
    if (steps.length === 0) {
      console.warn('no steps to add');
      return this;
    }

    validateArgument.steps(steps);

    this.#steps.push(...steps);

    return this;
  }

  addNode(segment, ...steps) {
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

  margeNode(node) {
    // validate argument in margeNode

    Node.margeNode(this, node);

    return this;
  }

  addRoute(method, path, ...steps) {
    // validate argument in new Route

    method = method.toUpperCase();

    if (this.#routes[method] !== undefined) {
      throw new Error(`method [${method}] already exists`);
    }

    this.#routes[method] = new Route(method, path, ...steps);

    return this.#routes[method];
  }

  toString(replacer, space) {
    return JSON.stringify(this, replacer, space);
  }

  static margeNode(stock, scion) {
    // eslint-disable-next-line no-use-before-define
    if (!(stock instanceof Node)) {
      throw new TypeError('stock must be an instance of Node');
    }
    // eslint-disable-next-line no-use-before-define
    if (!(scion instanceof Node)) {
      throw new TypeError('scion must be an instance of Node');
    }
    try {
      stock.params = new Set([...stock.params, ...scion.params]);

      stock.addSteps(...scion.steps);

      Object.entries(scion.nodes).forEach(([segment, node]) => {
        if (stock.nodes[segment] === undefined) {
          stock.nodes[segment] = node;
        } else {
          Node.margeNode(stock.nodes[segment], scion.nodes[segment]);
        }
      });

      Object.entries(scion.routes).forEach(([method, route]) => {
        if (stock.routes[method] === undefined) {
          stock.routes[method] = route;
        } else {
          console.warn(`method [${method}] already exists in node [${stock.segment}], merging method will be ignored`);
        }
      });
    } catch (error) {
      console.error(`margeNode error: ${error.message}`);
      throw error;
    }
  }
}

export default Node;
