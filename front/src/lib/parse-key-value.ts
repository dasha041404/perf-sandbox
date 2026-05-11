/**
 * Parse a multi-line "key: value" textarea into a JSON object.
 *
 * Supports basic value coercion:
 *   - "123"   -> 123
 *   - "12.5"  -> 12.5
 *   - "true"  -> true
 *   - "false" -> false
 *   - "null"  -> null
 *   - "[...]" or "{...}" -> JSON.parse attempt, falls back to raw string
 *   - "'foo'" / '"foo"' -> stripped quotes, kept as string
 *   - anything else -> raw string (trimmed)
 *
 * Blank lines and lines starting with `#` are ignored.
 * Throws on lines that don't contain a colon.
 */

export class KeyValueParseError extends Error {
  readonly line: number;
  constructor(message: string, line: number) {
    super(`Line ${line}: ${message}`);
    this.name = 'KeyValueParseError';
    this.line = line;
  }
}

function coerce(raw: string): unknown {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;

  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);

  if ((v.startsWith('[') && v.endsWith(']')) || (v.startsWith('{') && v.endsWith('}'))) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }

  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }

  return v;
}

export function parseKeyValue(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = input.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    const idx = raw.indexOf(':');
    if (idx === -1) {
      throw new KeyValueParseError(`expected "key: value", got "${trimmed}"`, i + 1);
    }
    const key = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1);
    if (key === '') {
      throw new KeyValueParseError('empty key before ":"', i + 1);
    }
    result[key] = coerce(value);
  }

  return result;
}
