/* eslint-disable no-underscore-dangle */

class Route {
  constructor(method, path, ...processes) {
    // this._method = method;
    this._path = path;
    this._processes = processes;
  }

  // add processes to the current node
  addProcesses(...processes) {
    this._processes.push(...processes);
  }
}

export default Route;
