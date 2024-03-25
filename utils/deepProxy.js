/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

function deepProxy(target, handler) {
  const createProxy = (value) => {
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        value[key] = createProxy(value[key]);
      }
      return new Proxy(value, handler);
    }
    return value;
  };

  return createProxy(target);
}

export default deepProxy;
