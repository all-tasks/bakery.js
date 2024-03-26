import {
  describe, test, expect, mock, beforeEach,
} from 'bun:test';

import Bakery from '#lib/Bakery';

describe('lib - class "Bakery"', async () => {
  let bakery;

  beforeEach(() => {
    bakery = new Bakery();
  });

  // test('addSteps should add steps', () => {
  //   const step = mock();
  //   bakery.addSteps(step);
  //   expect(bakery.steps).toContain(step);
  // });

  // test('addSteps should throw error when steps are not functions', () => {
  //   expect(() => {
  //     bakery.addSteps('not a function');
  //   }).toThrow(TypeError);
  // });

  // test('addSteps should warn when no steps are added', () => {
  //   console.warn = mock();
  //   bakery.addSteps();
  //   expect(console.warn).toHaveBeenCalledWith('no steps to add');
  // });
});
