import {
  describe, test, expect, vi,
} from 'vitest';

import validateArgument from '../../../modules/router/validateArgument.ts';

describe('module "router" - function "validateArgument"', async () => {
  test('validate "method"', async () => {
    expect(() => {
      validateArgument.method('GET');
    }).not.toThrow();
    expect(() => {
      validateArgument.method(true);
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.method('get');
    }).toThrow(TypeError);
    console.warn = vi.fn();
    validateArgument.method('INVALID');
    expect(console.warn).toBeCalledWith('method "INVALID" is not a valid HTTP method');
  });
  test('validate "routePath"', async () => {
    expect(() => {
      validateArgument.routePath('GET:/api/users');
    }).not.toThrow();
    expect(() => {
      validateArgument.routePath('GET:/api/users/:id');
    }).not.toThrow();
    expect(() => {
      validateArgument.routePath('GET:/api/users/*');
    }).not.toThrow();
    expect(() => {
      validateArgument.routePath('GET:/docs/README.md');
    }).not.toThrow();
    expect(() => {
      validateArgument.routePath(true);
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.routePath('GET:/api/users?');
    }).toThrow(TypeError);
  });
  test('validate "segment"', async () => {
    expect(() => {
      validateArgument.segment('users');
    }).not.toThrow();
    expect(() => {
      validateArgument.segment(':id');
    }).not.toThrow();
    expect(() => {
      validateArgument.segment('*');
    }).not.toThrow();
    expect(() => {
      validateArgument.segment(true);
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.segment('user?');
    }).toThrow(TypeError);
  });
  test('validate "steps"', async () => {
    expect(() => {
      validateArgument.steps([() => {}]);
    }).not.toThrow();
    expect(() => {
      validateArgument.steps([() => {}, true]);
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.steps(true);
    }).toThrow(TypeError);
  });
  test('validate "prefix"', async () => {
    expect(() => {
      validateArgument.prefix('/api');
    }).not.toThrow();
    expect(() => {
      validateArgument.prefix('/api/users');
    }).not.toThrow();
    expect(() => {
      validateArgument.prefix(true);
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.prefix('/api?');
    }).toThrow(TypeError);
  });
  test('validate "methodSteps"', async () => {
    expect(() => {
      validateArgument.methodSteps({ GET: [() => {}] });
    }).not.toThrow();
    expect(() => {
      validateArgument.methodSteps({ GET: [() => {}], POST: [() => {}] });
    }).not.toThrow();
    expect(() => {
      validateArgument.methodSteps({ GET: [() => {}], POST: true });
    }).toThrow(TypeError);
    expect(() => {
      validateArgument.methodSteps(true);
    }).toThrow(TypeError);
  });
});
