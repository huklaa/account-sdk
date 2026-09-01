// Copyright (c) 2018-2025 Coinbase, Inc. <https://www.coinbase.com/>

import { describe, expect, it } from 'vitest';
import { createProlinkUrl } from './index.node.js';

describe('Node prolink exports', () => {
  it('exports createProlinkUrl from the Node entrypoint', () => {
    expect(createProlinkUrl('encoded-prolink')).toBe(
      'https://base.app/base-pay?p=encoded-prolink'
    );
  });
});
