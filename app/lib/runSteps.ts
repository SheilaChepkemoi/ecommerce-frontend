/**
 * Runs save steps one after another (e.g. "update details", "add Dresses",
 * "remove Skirts"). A failed step does NOT stop the rest. Each failure is
 * already toasted by the global mutation error handler, so this only counts.
 */
export async function runSteps(steps: (() => Promise<unknown>)[]) {
  let saved = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await step();
      saved++;
    } catch {
      failed++;
    }
  }

  return { saved, failed };
}
