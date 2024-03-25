/* eslint-disable no-restricted-syntax */

function deepFreeze(obj) {

}

function cloneAndDeepFreeze(obj) {
  const clone = structuredClone(obj);
  deepFreeze(clone);
  return clone;
}

const test = {
  a: [1, 2, 3, 4],
  b: true,
  o: {
    c: 3,
    d: { e: 5 },
  },
  s: 'string',
};

deepFreeze(test);
