import {
  describe, test, expect,
} from 'vitest';

import runSteps from '#lib/steps';

describe('lib - function "runSteps"', async () => {
  test('validate arguments', async () => {
    await expect(runSteps()).rejects.toThrow();
    await expect(runSteps(true, true)).rejects.toThrow();
    await expect(runSteps([], true)).rejects.toThrow();
    await expect(runSteps([() => {}], true)).rejects.toThrow();
    await expect(runSteps([() => {}], {})).resolves.toBe(null);
  });

  test('after', async () => {
    const steps = [
      async function step1() {
        this.order.push(1);
        this.steps.next();
        this.order.push(1);
      },
      async function step2() {
        this.order.push(2);
        this.steps.after(
          async function step2dot1() {
            this.order.push(2.1);
            this.steps.next();
            this.order.push(2.1);
          },
          async function step2dot2() {
            this.order.push(2.2);
            this.steps.next();
            this.order.push(2.2);
          },
        );
        this.steps.next();
        this.order.push(2);
      },
      async function step3() {
        this.order.push(3);
        this.steps.next();
        this.order.push(3);
      },
    ];
    const context = { order: [] };

    await runSteps(steps, context);

    expect(context.order).toEqual([1, 2, 2.1, 2.2, 3, 3, 2.2, 2.1, 2, 1]);
  });

  test('throw error', async () => {
    const steps = [
      async function step1() {
        throw new Error('error');
      },
    ];
    expect(runSteps(steps)).rejects.toThrow();
  });
});
