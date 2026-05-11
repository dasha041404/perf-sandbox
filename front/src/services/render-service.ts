import { apiRequest } from './api-client';
import type { ExperimentInputData } from './backend-types';

const PUG_RENDER_PATH = '/render/pug';

interface PugRenderResponse {
  output: string;
}

/**
 * Render a Pug template on the backend. We don't run Pug in the browser:
 * the `pug` npm package depends on Node-only modules and has no upstream
 * browser build. See [`back/src/pug_renderer.py`](../../../back/src/pug_renderer.py).
 */
export async function renderPug(template: string, data: ExperimentInputData): Promise<string> {
  const res = await apiRequest<PugRenderResponse, { template: string; data: ExperimentInputData }>(
    PUG_RENDER_PATH,
    {
      method: 'POST',
      body: { template, data },
    },
  );
  return res.output;
}
