// Copyright (c) 2018-2025 Coinbase, Inc. <https://www.coinbase.com/>

import { describe, expect, it } from 'vitest';
import { createProlinkUrl } from './createProlinkUrl.js';

describe('createProlinkUrl reserved payload parameter', () => {
  it('does not allow additional params to overwrite the prolink payload', () => {
    const result = createProlinkUrl('real-prolink', undefined, {
      p: 'override',
      ref: 'campaign',
    });

    const url = new URL(result);
    expect(url.searchParams.get('p')).toBe('real-prolink');
    expect(url.searchParams.get('ref')).toBe('campaign');
  });

  it('replaces an existing p query parameter with the prolink payload', () => {
    const result = createProlinkUrl('real-prolink', 'https://base.app/base-pay?p=stale');

    expect(new URL(result).searchParams.get('p')).toBe('real-prolink');
  });
});
