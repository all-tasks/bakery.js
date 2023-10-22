class Route {
  constructor(path, controllers = []) {
    this.path = path;
    this.params = [];
    this.controllers = controllers;
  }

  addControllers(controllers) {
    this.controllers.push(controllers);
  }
}

export default Route;
