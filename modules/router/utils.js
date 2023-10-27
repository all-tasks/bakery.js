/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

function matchParam(segment) {
  return /^:{1}(.+)$/.exec(segment)?.[1];
}

/**
 * Merge two nodes // grafting
 * @param {Node} stock
 * @param {Node} scion
 */

function margeNode(stock, scion) {
  stock._params.push(...scion._params);
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
  matchParam,
  margeNode,
};
