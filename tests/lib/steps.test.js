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
    await expect(runSteps([() => {}], {})).resolves.toBe(undefined);
  });

  test('run steps', async () => {
    const steps = [
      async function step1() {
        this.order.push(1);
        this.steps.next();
        this.order.push(1);
      },
      async function step2() {
        this.order.push(2);
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

    expect(context.order).toEqual([1, 2, 3, 3, 2, 1]);
  });

  test('throw error when next() is called more than once in the same step', async () => {
    const steps = [
      async function step1() {
        this.steps.next();
        this.steps.next();
      },
      async function step2() {
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
  });

  test('steps props', async () => {
    const steps = [
      async function step1() {
        this.steps.next();
      },
      async function step2() {
        expect(this.steps.length).toBe(2);
        expect(this.steps.value).toEqual(steps);
        expect(this.steps.index).toBe(1);
        expect(this.steps.current).toBe(steps[1]);
        expect(this.steps.current.name).toBe('step2');
        this.steps.next();
      },
    ];

    runSteps(steps, {});
  });

  test('can\'n edit steps props', async () => {
    let steps = [
      async function step1() {
        this.steps.length = 0;
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.value = [];
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.value.length = 0;
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.value.push(() => {});
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.index = 100;
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.current = () => {};
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
    steps = [
      async function step1() {
        this.steps.next = () => {};
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow();
  });

  test('insert steps', async () => {
    const steps = [
      async function step1() {
        this.order.push(1);
        this.steps.next();
        this.order.push(1);
      },
      async function step2() {
        this.order.push(2);
        this.steps.insert(
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
        this.steps.insert(
          async function step2dot3() {
            this.order.push(2.3);
            this.steps.next();
            this.order.push(2.3);
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

    expect(context.order).toEqual([1, 2, 2.1, 2.2, 2.3, 3, 3, 2.3, 2.2, 2.1, 2, 1]);
  });

  test('insert arguments', async () => {
    const steps = [
      async function step1() {
        this.steps.insert();
        this.steps.next();
      },
      async function step2() {
        this.steps.next();
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow('steps must be a non-empty array of functions');
  });

  test('throw error', async () => {
    const steps = [
      async function step1() {
        throw new Error('error');
      },
    ];
    expect(runSteps(steps, {})).rejects.toThrow('error');
  });
});
