/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

const validCharactersInURI = /^[a-zA-Z0-9!#$%&'()*+,-./:;=?@_~]*$/;
const validCharactersInPath = /^[a-zA-Z0-9-_/:]*$/;
const validCharactersInMethod = /^[a-zA-Z]+$/;

const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

function matchParam(segment) {
  return /^:{1}(.+)$/.exec(segment)?.[1];
}

/**
 * Merge two nodes // grafting
 * @param {Node} stock
 * @param {Node} scion
 */

function margeNode(stock, scion) {
  scion._params.forEach((param) => {
    stock._params.add(param);
  });

  stock.addProcesses(...scion._processes);

  // eslint-disable-next-line no-restricted-syntax
  for (const key in scion) {
    if (!/^_.*$/.test(key)) {
      if (stock[key] === undefined) {
        stock[key] = scion[key];
      } else if (
        stock[key].constructor.name === 'Node'
        && scion[key].constructor.name === 'Node') {
        margeNode(stock[key], scion[key]);
      } else if (stock[key].constructor.name === 'Route'
        && scion[key].constructor.name === 'Route') {
        stock[key].addProcesses(...scion[key]._processes);
      } else {
        throw new Error('Type Mismatch');
      }
    }
  }
}

export {
  validCharactersInURI,
  validCharactersInPath,
  validCharactersInMethod,
  validMethods,
  matchParam,
  margeNode,
};
