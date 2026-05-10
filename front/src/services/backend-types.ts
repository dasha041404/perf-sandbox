export type TemplateEngine = 'Handlebars' | 'Mustache' | 'EJS' | 'Pug' | 'Nunjucks' | 'Liquid';

export type ExperimentInputData = Record<string, unknown> | unknown[];

export interface ExperimentItem {
  id: number;
  engine: TemplateEngine;
  input_template: string;
  input_data: ExperimentInputData;
  output: string;
  execution_time: number;
  data: string;
}

export interface CreateExperimentPayload {
  engine: TemplateEngine;
  input_template: string;
  input_data: ExperimentInputData;
  output: string;
  execution_time: number;
  data: string;
}

export interface PaginatedExperimentsResponse {
  items: ExperimentItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListTemplatesRequestParams {
  engines: TemplateEngine[];
  input_engine: TemplateEngine;
  input_template: string;
}

export type ListTemplatesResponse = Record<string, string>;
