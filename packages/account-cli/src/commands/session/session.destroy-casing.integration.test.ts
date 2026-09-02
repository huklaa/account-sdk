import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_PATH = join(import.meta.dirname, '../../index.ts');

function runJson(args: string[], env: Record<string, string>): Record<string, unknown> {
  const stdout = execFileSync('npx', ['tsx', CLI_PATH, ...args, '--json'], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 10_000,
  });
  return JSON.parse(stdout);
}

function seedExternalEoa(dir: string, eoa: string): string {
  const sessionsDir = join(dir, 'sessions');
  mkdirSync(sessionsDir, { recursive: true, mode: 0o700 });
  const path = join(sessionsDir, `external-eoa-${eoa}.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        version: 1,
        mode: 'external-eoa',
        account: '0xParent000',
        eoa,
        chainId: 'eip155:8453',
        createdAt: '2026-03-23T00:00:00Z',
      },
      null,
      2
    ),
    { mode: 0o600 }
  );
  return path;
}

describe('session destroy address casing', () => {
  let tmpDir: string;
  let env: Record<string, string>;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'base-cli-destroy-casing-'));
    env = { BASE_ACCOUNT_DIR: tmpDir };
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('destroys a session when identifier casing differs from the stored address', () => {
    const path = seedExternalEoa(tmpDir, '0xEoa444');

    const result = runJson(['session', 'destroy', '0xeoa444'], env);

    expect(result.status).toBe('destroyed');
    expect(result.identifier).toBe('0xEoa444');
    expect(existsSync(path)).toBe(false);
  });

  it('destroys a session case-insensitively when --mode is provided', () => {
    const path = seedExternalEoa(tmpDir, '0xEoa444');

    const result = runJson(
      ['session', 'destroy', '0xeoa444', '--mode', 'external-eoa'],
      env
    );

    expect(result.status).toBe('destroyed');
    expect(result.mode).toBe('external-eoa');
    expect(result.identifier).toBe('0xEoa444');
    expect(existsSync(path)).toBe(false);
  });
});
