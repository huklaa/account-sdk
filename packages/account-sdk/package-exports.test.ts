import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

type ExportMap = Record<string, unknown>;

function collectRequireTargets(value: unknown, targets: string[]): void {
  if (!value || typeof value !== 'object') return;

  for (const [key, nested] of Object.entries(value as ExportMap)) {
    if (key === 'require' && typeof nested === 'string') {
      targets.push(nested);
      continue;
    }

    collectRequireTargets(nested, targets);
  }
}

describe('package exports', () => {
  it('does not advertise ESM .js files as CommonJS require targets', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
    ) as { exports?: unknown };
    const requireTargets: string[] = [];

    collectRequireTargets(packageJson.exports, requireTargets);

    expect(requireTargets.every((target) => target.endsWith('.cjs'))).toBe(true);
  });
});
