/* eslint-disable no-underscore-dangle */

import validateArgument from './validateArgument.js';

class Route {
  #method;

  #path;

  #steps = [];

  #proxy = new Proxy(this, {
    get(target, property) {
      return (property === 'proxy' || typeof target[property] === 'function') ? undefined : target[property];
    },
    set() {
      throw new Error('route is immutable');
    },
  });

  #meta;

  constructor(method, routePath, ...steps) {
    validateArgument.all({ method, routePath, steps });

    this.#method = method;

    this.#path = routePath;

    this.#steps.push(...steps);

    Object.defineProperties(this, {
      method: {
        enumerable: true,
        writable: false,
        value: this.#method,
      },
      path: {
        enumerable: true,
        writable: false,
        value: this.#path,
      },
      steps: {
        enumerable: true,
        get: () => Object.freeze([...this.#steps]),
      },
      proxy: {
        enumerable: true,
        get: () => this.#proxy,
      },
      meta: {
        enumerable: true,
        get: () => Object.freeze({ ...this.#meta }),
      },
    });
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

  updateMeta(meta) {
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
      throw new TypeError('meta must be an object');
    }

    this.#meta = { ...this.#meta, ...meta };

    return this;
  }

  toString(space) {
    return JSON.stringify(this, ['method', 'path', 'meta'], space);
  }

  static parseRoutePath(routePath) {
    try {
      if (typeof routePath !== 'string' || !routePath) {
        throw new TypeError('routePath must be a non-empty string');
      }

      const { method, path } = routePath.match(/^(?<method>[A-Z-]+):(?<path>\/[\w-./:]*)$/)?.groups || {};

      if (method === undefined || path === undefined) {
        throw new TypeError('invalid routePath');
      }

      const segments = path.match(/((?<=\/):?[\w-.]+(?![\w-.]*[:]))+/g) || [];

      if (segments.length !== path.split('/').filter((segment) => segment).length) {
        throw new TypeError('invalid routePath');
      }

      const params = path.match(/((?<=\/:)[\w-.]+(?![\w-.]*[:]))+/g);

      return {
        method,
        path,
        segments,
        ...(params && { params }),
      };
    } catch (error) {
      console.error();
      throw error;
    }
  }
}

export default Route;
