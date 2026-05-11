import type { ExperimentItem, TemplateEngine } from '../services/backend-types';

export type HeatBucket = 'fast' | 'medium' | 'slow';

export const HEAT_THRESHOLDS_MS = {
  fast: 5, // < 5 ms
  medium: 50, // 5..50 ms
  // > 50 ms => slow
};

export function bucketFor(ms: number): HeatBucket {
  if (ms < HEAT_THRESHOLDS_MS.fast) return 'fast';
  if (ms < HEAT_THRESHOLDS_MS.medium) return 'medium';
  return 'slow';
}

export const BUCKET_COLORS: Record<HeatBucket, string> = {
  fast: 'var(--mantine-color-teal-7)',
  medium: 'var(--mantine-color-yellow-7)',
  slow: 'var(--mantine-color-red-7)',
};

export interface HeatmapModel {
  engines: TemplateEngine[];
  outputs: string[]; // unique output values (rendered template output)
  cells: Record<string, number | null>; // key = `${engine}::${output}` -> ms or null
}

/**
 * Build a heatmap from a list of experiments. Cells aggregate by averaging
 * execution time of all experiments matching (engine, output).
 */
export function buildHeatmap(items: ExperimentItem[]): HeatmapModel {
  const enginesSet = new Set<TemplateEngine>();
  const outputsSet = new Set<string>();
  const sums = new Map<string, { sum: number; count: number }>();

  for (const it of items) {
    enginesSet.add(it.engine);
    outputsSet.add(it.output);
    const key = `${it.engine}::${it.output}`;
    const cur = sums.get(key) ?? { sum: 0, count: 0 };
    cur.sum += it.execution_time * 1000;
    cur.count += 1;
    sums.set(key, cur);
  }

  const cells: Record<string, number | null> = {};
  const engines = Array.from(enginesSet);
  const outputs = Array.from(outputsSet);
  for (const e of engines) {
    for (const out of outputs) {
      const key = `${e}::${out}`;
      const agg = sums.get(key);
      cells[key] = agg ? agg.sum / agg.count : null;
    }
  }
  return { engines, outputs, cells };
}

export function truncate(s: string, max = 22): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}
