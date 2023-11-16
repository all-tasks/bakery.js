/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import Route from './Route.js';

import {
  validCharactersInMethod,
  validCharactersInPath,
  validMethods,
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

    // this._segment = param === undefined ? segment : ':param';
    this._params = new Set(param === undefined ? [] : [param]);
    this._processes = processes;
    this._routeProcesses = [];
  }

  // add a sub node to the current node
  addNode(segment, ...processes) {
    // validate argument segment
    if (typeof segment !== 'string' || !validCharactersInSegment.test(segment)) {
      throw new Error(`Invalid Segment: ${segment}`);
    }

    // validate argument processes
    if (processes.length !== 0 && processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    // check if the current segment is a param
    const param = matchParam(segment);

    // if the current segment is a param, use ':param' as sub node key
    const key = param === undefined ? segment : ':param';

    // if the sub node does not exist, create a new sub node and return
    if (this[key] === undefined) {
      this[key] = new Node(segment, ...processes);
      return this[key];
    }

    // if the sub node exists, add processes to exist sub node
    this[key].addProcesses(...processes);

    // if segment is a param, add param to exist sub node
    if (param !== undefined) {
      this[key]._params.add(param);
    }

    return this[key];
  }

  // add a route to the current node
  addRoute(method, path, ...processes) {
    // validate argument method
    if (
      typeof method !== 'string'
      || method === ''
      || !validCharactersInMethod.test(method)) {
      throw new Error(`Invalid Method: ${method}`);
    }

    if (!validMethods.includes(method)) {
      console.warn(`Not Valid Method: "${method}"`);
    }

    // validate argument path
    if (
      typeof path !== 'string'
      || path === ''
      || !validCharactersInPath.test(path)) {
      throw new Error(`Invalid Path: ${path}`);
    }

    // validate argument processes
    if (processes.length !== 0 && processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    // if the method dose not exist, create a new route
    if (this[method] === undefined) {
      this[method] = new Route(method, path, ...processes);
      return this;
    }

    // if the method exist, warning and add processes to exist route
    console.warn(`Duplicate Route Method: "${path}". Will Add Processes To Exist Route`);

    this[method].addProcesses(...processes);

    return this;
  }

  // add processes to the current node
  addProcesses(...processes) {
    // validate argument processes
    if (processes.length !== 0 && processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    this._processes.push(...processes);

    return this;
  }

  // add processes to all routes under the current node
  addRouteProcesses(...processes) {
    // validate argument processes
    if (processes.length !== 0 && processes.some((fn) => (typeof fn !== 'function'))) {
      throw new Error('Invalid Processes');
    }

    this._routeProcesses = processes;

    return this;
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
