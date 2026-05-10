import { apiUrl } from '../config/env';
import { ApiClientError, type ApiRequestOptions, type QueryParams } from './api-types';

function buildUrl(path: string, query?: QueryParams): URL {
  const normalizedBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const url = new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);

  if (!query) {
    return url;
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue == null) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        if (item != null) {
          url.searchParams.append(key, String(item));
        }
      }
      continue;
    }

    url.searchParams.set(key, String(rawValue));
  }

  return url;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === '') {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, status: number): string {
  if (typeof body === 'string' && body.trim() !== '') {
    return body;
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const detail = record.detail ?? record.message;
    if (typeof detail === 'string' && detail.trim() !== '') {
      return detail;
    }
    if (detail != null) {
      return String(detail);
    }
  }

  return `Request failed with status ${status}`;
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', query, body, headers } = options;
  const url = buildUrl(path, query);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      requestHeaders[key] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      requestHeaders[key] = value;
    }
  } else if (headers) {
    Object.assign(requestHeaders, headers);
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const parsedBody = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError(getErrorMessage(parsedBody, response.status), {
      status: response.status,
      body: parsedBody,
    });
  }

  return parsedBody as TResponse;
}
