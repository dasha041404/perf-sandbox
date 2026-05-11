import Handlebars from 'handlebars';
import Mustache from 'mustache';
import ejs from 'ejs';
import nunjucks from 'nunjucks';
import { Liquid } from 'liquidjs';

import { renderPug } from '../services/render-service';
import type { TemplateEngine } from '../services/backend-types';

export type TemplateContext = Record<string, unknown> | unknown[];

export type TemplateRunner = (template: string, data: TemplateContext) => Promise<string> | string;

export class TemplateRunError extends Error {
  readonly engine: TemplateEngine;
  constructor(engine: TemplateEngine, message: string) {
    super(`[${engine}] ${message}`);
    this.name = 'TemplateRunError';
    this.engine = engine;
  }
}

export class UnsupportedEngineError extends TemplateRunError {
  constructor(engine: TemplateEngine, reason: string) {
    super(engine, reason);
    this.name = 'UnsupportedEngineError';
  }
}

export interface EngineRunner {
  /** False when the engine cannot run in the current environment (e.g. browser). */
  readonly supported: boolean;
  /** Human-readable reason; only meaningful when `supported === false`. */
  readonly unsupportedReason?: string;
  readonly run: TemplateRunner;
}

const liquid = new Liquid();
nunjucks.configure({ autoescape: false });

function asObject(data: TemplateContext): Record<string, unknown> {
  return Array.isArray(data) ? { items: data } : data;
}

/**
 * Registry of template engines.
 *
 * Pug is rendered server-side via {@link renderPug} because the `pug` npm
 * package depends on Node-only modules (`fs`, `path`, `assert`, `acorn`) and
 * has no upstream browser build. All other engines render in-browser.
 */
export const RUNNERS: Record<TemplateEngine, EngineRunner> = {
  Handlebars: {
    supported: true,
    run: (tpl, data) => Handlebars.compile(tpl)(asObject(data)),
  },
  Mustache: {
    supported: true,
    run: (tpl, data) => Mustache.render(tpl, asObject(data)),
  },
  EJS: {
    supported: true,
    run: (tpl, data) => ejs.render(tpl, asObject(data)),
  },
  Nunjucks: {
    supported: true,
    run: (tpl, data) => nunjucks.renderString(tpl, asObject(data)),
  },
  Liquid: {
    supported: true,
    run: (tpl, data) => liquid.parseAndRender(tpl, asObject(data)),
  },
  Pug: {
    supported: true,
    run: (tpl, data) => renderPug(tpl, data),
  },
};

export const ENGINES: TemplateEngine[] = [
  'Handlebars',
  'Mustache',
  'EJS',
  'Pug',
  'Nunjucks',
  'Liquid',
];

export function isEngineSupported(engine: TemplateEngine): boolean {
  return RUNNERS[engine]?.supported === true;
}
