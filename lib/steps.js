/* eslint-disable no-inner-declarations */

/**
 * runSteps - Run a list of steps in sequence
 *
 * @description This function sequentially executes a series of steps, passing a shared context
 *              object to each step for data processing. It provides two methods for enhanced
 *              processing flow: <br><br>
 *              __Adding subsequent steps__: By invoking the __steps.after()__ method within the
 *              context object, the current step can add more steps to the sequence right after the
 *              current step. This allows for dynamic expansion of the processing flow. <br><br>
 *              __Jumping to the next step__: By invoking the __steps.next()__ method within the
 *              context object, move to the next step in the list. This provides explicit control
 *              over transitions between steps.
 *
 * @param {Function[]} steps
 * @param {Object} context
 *
 */

async function runSteps(steps = [], context = {}) {
  if (!Array.isArray(steps) || !steps.length || steps.some((step) => typeof step !== 'function')) {
    throw new TypeError('steps must be a non-empty array of functions');
  }
  if (typeof context !== 'object' || context === null) {
    throw new TypeError('context must be an object');
  }

  const localSteps = [...steps]; // copy for avoid pollution the original
  let currentStepIndex = -1;

  // eslint-disable-next-line no-shadow
  function after(...steps) {
    localSteps.splice(currentStepIndex + 1, 0, ...steps);
  }

  function dispatchStep(nextStepIndex) {
    if (nextStepIndex <= currentStepIndex) Promise.reject(new Error('next() already called'));
    currentStepIndex = nextStepIndex;
    context.steps = {
      after,
      next: dispatchStep.bind(null, currentStepIndex + 1),
    };
    try {
      return Promise.resolve(localSteps[currentStepIndex]?.call(context, context) || null);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return dispatchStep(0);
}

export default runSteps;

export {
  runSteps,
};
