// Testing functions:
import { describe, expect, test } from 'vitest';

import { isNumber } from './util';

describe('util', () => {
  describe('isNumber', () => {
    test.each([
      ['124', true],
      ['14.742', true],
      ['154.3521.64', false],
      ['hello world', false],
      ['foo', false],
      ['0000', true],
    ])("isNumber('%s') should return %b", (text, expected) => {
      const actual = isNumber(text);

      expect(actual).toBe(expected);
    });
  });
});
