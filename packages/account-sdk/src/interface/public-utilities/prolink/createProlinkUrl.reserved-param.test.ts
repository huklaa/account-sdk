// Copyright (c) 2018-2025 Coinbase, Inc. <https://www.coinbase.com/>

import { describe, expect, it } from 'vitest';
import { createProlinkUrl } from './createProlinkUrl.js';

describe('createProlinkUrl reserved query params', () => {
  it('keeps the encoded prolink authoritative over additional params', () => {
    const result = createProlinkUrl('real-prolink', undefined, {
      p: 'override',
      ref: 'campaign',
    });
    const url = new URL(result);

    expect(url.searchParams.get('p')).toBe('real-prolink');
    expect(url.searchParams.get('ref')).toBe('campaign');
  });
});
