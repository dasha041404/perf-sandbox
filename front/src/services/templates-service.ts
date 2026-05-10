import { apiRequest } from './api-client';
import type { ListTemplatesRequestParams, ListTemplatesResponse } from './backend-types';

const LIST_TEMPLATES_PATH = '/list_templates';

export function getTemplates(params: ListTemplatesRequestParams) {
  return apiRequest<ListTemplatesResponse>(LIST_TEMPLATES_PATH, {
    query: {
      engines: params.engines.join(','),
      input_engine: params.input_engine,
      input_template: params.input_template,
    },
  });
}
