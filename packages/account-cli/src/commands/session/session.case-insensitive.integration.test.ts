import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_PATH = join(import.meta.dirname, '../../index.ts');

function runJson(args: string[], env: Record<string, string>): Record<string, unknown> {
  try {
    const stdout = execFileSync('npx', ['tsx', CLI_PATH, ...args, '--json'], {
      encoding: 'utf-8',
      env: { ...process.env, ...env },
      timeout: 10_000,
    });
    return JSON.parse(stdout);
  } catch (e: unknown) {
    const err = e as { stdout?: string };
    return JSON.parse(err.stdout ?? '{}');
  }
}

function seedExternalEoa(dir: string): string {
  const sessionsDir = join(dir, 'sessions');
  mkdirSync(sessionsDir, { recursive: true, mode: 0o700 });
  const filename = 'external-eoa-0xEoa444.json';
  writeFileSync(
    join(sessionsDir, filename),
    JSON.stringify(
      {
        version: 1,
        mode: 'external-eoa',
        account: '0xParent000',
        eoa: '0xEoa444',
        chainId: 'eip155:8453',
        createdAt: '2026-03-23T00:00:00Z',
      },
      null,
      2
    ),
    { mode: 0o600 }
  );
  return join(sessionsDir, filename);
}

describe('session destroy address casing', () => {
  let tmpDir: string;
  let env: Record<string, string>;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'base-cli-case-integ-'));
    env = { BASE_ACCOUNT_DIR: tmpDir };
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('destroys a stored mixed-case session using a lowercase identifier', () => {
    const filePath = seedExternalEoa(tmpDir);

    const result = runJson(['session', 'destroy', '0xeoa444'], env);

    expect(result.status).toBe('destroyed');
    expect(existsSync(filePath)).toBe(false);
  });

  it('destroys a stored mixed-case session using lowercase identifier with explicit mode', () => {
    const filePath = seedExternalEoa(tmpDir);

    const result = runJson(
      ['session', 'destroy', '0xeoa444', '--mode', 'external-eoa'],
      env
    );

    expect(result.status).toBe('destroyed');
    expect(existsSync(filePath)).toBe(false);
  });
});
