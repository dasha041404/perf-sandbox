import {
  RUNNERS,
  TemplateRunError,
  UnsupportedEngineError,
  type TemplateContext,
} from './template-runners';
import type { TemplateEngine } from '../services/backend-types';

export interface RunResult {
  output: string;
  execution_time_seconds: number;
  execution_time_ms: number;
}

/**
 * Render a template with the chosen engine and measure wall-clock execution
 * via performance.now(). Returns both seconds (for the backend schema)
 * and milliseconds (for the UI).
 *
 * Engines marked `supported: false` (see {@link RUNNERS}) short-circuit with a
 * typed {@link UnsupportedEngineError} before any timing starts.
 */
export async function runExperiment(
  engine: TemplateEngine,
  template: string,
  data: TemplateContext,
): Promise<RunResult> {
  const runner = RUNNERS[engine];
  if (!runner) {
    throw new TemplateRunError(engine, 'unknown engine');
  }
  if (!runner.supported) {
    throw new UnsupportedEngineError(
      engine,
      runner.unsupportedReason ?? 'engine is not supported in this environment',
    );
  }

  const start = performance.now();
  let output: string;
  try {
    output = await Promise.resolve(runner.run(template, data));
  } catch (e) {
    if (e instanceof TemplateRunError) throw e;
    throw new TemplateRunError(engine, e instanceof Error ? e.message : String(e));
  }
  const elapsed = performance.now() - start;

  return {
    output: typeof output === 'string' ? output : String(output),
    execution_time_seconds: elapsed / 1000,
    execution_time_ms: elapsed,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
