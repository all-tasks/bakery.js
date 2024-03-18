/* eslint-disable no-underscore-dangle */

class Route {
  #method;

  #path;

  #steps;

  #meta;

  constructor(method, path, ...steps) {
    // TODO: validateArgument.method
    // TODO: validateArgument.path
    // TODO: validateArgument.steps

    this.#method = method;

    this.#path = path;

    this.#steps = steps;

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
    });
  }

  addSteps(...steps) {
    this.#steps.push(...steps);
  }

  updateMeta(meta) {
    this.#meta = { ...this.#meta, ...meta };
  }

  static parseRoutePath(routePath) {
    try {
      // TODO: validateArgument.nonEmptyString(routePath)

      const { method, path } = routePath.match(/^(?<method>[A-Z-]+):(?<path>\/[\w-./:]*)$/)?.groups || {};

      if (method === undefined || path === undefined) {
        throw new TypeError('invalid routePath');
      }

      const segments = path.match(/((?<=\/)[:]?[\w-.]+(?![\w-.]*[:]))+/g) || [];

      if (segments.length !== path.match(/((?<=\/)[\w-.:]+)+/g).length) {
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
