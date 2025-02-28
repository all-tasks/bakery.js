import { get } from 'node:http';
import { Step, Context } from './types';

/**
 * runSteps - Executes a sequence of steps(function).
 *
 * @description This function sequentially executes a series of steps, passing a shared context
 *              object to each step for data processing. It provides two methods for enhanced
 *              processing flow: <br><br>
 *
 *              __Adding subsequent steps__: By invoking the __steps.insert()__ method within the
 *              context object, the current step can add more steps to the sequence right after the
 *              current step. This allows for dynamic expansion of the processing flow. <br>
 *              Note: Since the context is bound to step functions, you should define steps using
 *              regular functions (not arrow functions) to access the context via `this`.
 *              Alternatively, if using arrow functions, access the context through the first
 *              parameter: `(context) => { context.steps.next(); }`.<br><br>
 *
 *              __Jumping to the next step__: By invoking the __steps.next()__ method within the
 *              context object, move to the next step in the list. This provides explicit control
 *              over transitions between steps. Meanwhile, runSteps implements an "onion model"
 *              execution flow. It recursively calls steps in a [1, 2, 3, 4, 4, 3, 2, 1] pattern
 *              where context data can be processed both before and after the __steps.next()__ call.
 *              <br>
 *              Note: The __steps.next()__ method should be called only once per step.
 *
 *              Properties: <br><br>
 *              __length__: The total number of steps in the sequence. <br><br>
 *              __value__: An array of all steps in the sequence. <br><br>
 *              __index__: The index of the current step in the sequence. <br><br>
 *              __current__: The current step being executed. <br><br>
 *
 * @param {Function[]} steps - Array of step functions
 * @param {Object} context - Context object shared between steps
 *
 * @returns {Promise<void>} Resolves when all steps complete execution
 *
 * @example
 *              await runSteps([
 *                async function step1() {
 *                  console.log('1 →'); // Executes first
 *                  this.steps.next();
 *                  console.log('← 1'); // Executes last (after step2 completes)
 *                },
 *                async function step2() {
 *                  console.log('2 →'); // Executes second
 *                  this.steps.next();
 *                  console.log('← 2'); // Executes third (after any next steps)
 *                }
 *              ], {});
 *              // Output: '1 →', '2 →', '← 2', '← 1'
 */

async function runSteps(steps: Step[], context: Context): Promise<void> {
  if (!Array.isArray(steps) || !steps.length || steps.some((step) => typeof step !== 'function')) {
    throw new TypeError('steps must be a non-empty array of functions');
  }
  if (typeof context !== 'object' || context === null) {
    throw new TypeError('context must be an object');
  }

  const localSteps = [...steps]; // copy for avoid pollution the original

  const executeStep = async (index: number) => {
    if (index >= localSteps.length) return;
    const currentStep = localSteps[index];

    let nextCalled = false;
    let insertOffset = 0;

    function insertStep(...steps: Step[]): void {
      if (!steps.length || steps.some((step) => typeof step !== 'function')) {
        throw new TypeError('steps must be a non-empty array of functions');
      }
      localSteps.splice(index + insertOffset + 1, 0, ...steps);
      insertOffset += steps.length;
    }

    function nextStep(): Promise<void> {
      if (nextCalled) {
        throw new Error(`Step ${index} [${currentStep.name}] already called next()`);
      }
      nextCalled = true;
      return Promise.resolve(executeStep(index + 1));
    }

    context.steps = Object.freeze({
      length: localSteps.length,
      value: Object.freeze([...localSteps]) as Step[],
      index,
      current: currentStep,
      insertStep,
      insert: insertStep,
      after: insertStep,
      nextStep,
      next: nextStep,
    });

    return await Promise.resolve(currentStep.call(context, context));
  };

  return executeStep(0);
}

export default runSteps;

export { runSteps };
