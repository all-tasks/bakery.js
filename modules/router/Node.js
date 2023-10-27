/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import Route from './Route.js';

import {
  matchParam,
  margeNode,
} from './utils.js';

const validCharactersInSegment = /^:?[a-zA-Z0-9]+[a-zA-Z0-9-_]*$/;

class Node {
  constructor(segment, ...processes) {
    // validate argument segment
    if (typeof segment !== 'string' || !validCharactersInSegment.test(segment)) {
      throw new Error(`Invalid Segment: ${segment}`);
    }

    // validate argument processes
    if (processes.length !== 0 && processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    const param = matchParam(segment);
    this._segment = param === undefined ? segment : ':param';
    this._params = param === undefined ? [] : [param];
    this._processes = processes;
  }

  // add a sub node to the current node
  addNode(segment, ...processes) {
    // check if the current segment is a param
    const param = matchParam(segment);

    // if the current segment is a param, use ':param' as sub node key
    const key = param === undefined ? segment : ':param';

    console.log('--------', param);

    // if the sub node does not exist, create a new sub node and return it
    if (this[key] === undefined) {
      this[key] = new Node(segment, ...processes);
      return this[key];
    }

    // if the sub node exists, add processes to exist sub node and return it
    this[key].addProcesses(...processes);

    // if the current segment is a param, add the param to the sub node params
    if (param !== undefined) {
      this[key]._params.push(param);
    }

    return this[key];
  }

  // add a route to the current node
  addRoute(method, path, ...processes) {
    // eslint-disable-next-line no-use-before-define
    this[method] = new Route(method, path, ...processes);
  }

  // add processes to the current node
  addProcesses(...processes) {
    this._processes.push(...processes);
  }

  // marge the scion node into the current node
  margeNode(scion) {
    // validate argument scion
    if (!(scion instanceof Node)) {
      throw new Error('Invalid Scion');
    }

    margeNode(this, scion);

    return this;
  }
}

export default Node;
