export type HttpMethod = 'GET' | 'POST';

export type QueryParamValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryParamValue | readonly QueryParamValue[]>;

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  query?: QueryParams;
  body?: TBody;
  headers?: HeadersInit;
}

export interface ApiClientErrorOptions {
  status: number;
  body?: unknown;
}

export class ApiClientError extends Error {
  readonly status: number;

  readonly body: unknown;

  constructor(message: string, options: ApiClientErrorOptions) {
    super(message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.body = options.body;
  }
}
