import { describe, test, expect, vi } from 'vitest';

import RoutingCache from '../../../modules/router/RoutingCache.ts';

describe('module "router" - class "RoutingCache"', async () => {
  test('validate arguments', async () => {
    expect(() => {
      new RoutingCache();
    }).not.toThrow();

    expect(() => {
      new RoutingCache(100);
    }).not.toThrow();

    expect(() => {
      new RoutingCache(0);
    }).toThrow();

    console.warn = vi.fn();
    new RoutingCache(1.234);
    expect(console.warn).toHaveBeenCalledWith('maxSize should be an integer');
  });
});
