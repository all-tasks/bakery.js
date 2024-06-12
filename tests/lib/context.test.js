import {
  describe, test,
} from 'vitest';

import createContext from '#lib/context';

describe('lib - function "createContext"', async () => {
  test('this.next() -> this.steps.next()', async () => {
    const context = createContext();
  });
});
