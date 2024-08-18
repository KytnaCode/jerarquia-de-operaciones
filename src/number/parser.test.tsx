import { describe, expect, test } from 'vitest';
import { Parser } from './parser';
import { Lexer } from './lexer';

describe('parser', () => {
  test.each([
    ['an empty string', ''],
    ['spaces', ' '],
    ['new lines', '\n'],
    ['tabs', '\t'],
    ['carriage returns', '\r'],
    ['whitespaces', ' \n\t\r'],
  ])('should throw an error with only %s', (_, whitespace) => {
    const input = whitespace.repeat(3);

    const parser = new Parser(new Lexer(input));

    expect(parser.parse).toThrowError();
  });

  test.each([
    ['12 + 12', 24],
    ['187 * 102', 19074],
    ['15 / 2', 7.5],
    ['1948 - 293', 1655],
    ['1925 + 235 + 16', 2176],
    ['12 * 199 - 5', 2383],
    ['111 - 156 * 2', -201],
    ['10 / (7 - 2)', 2],
    ['{10 * [ 20 * ( 30 - 2 ) ] }', 5600],
    ['10 + (-10)', 0],
  ])("'%s' should return a number with value of %f", (input, expected) => {
    const actual = new Parser(new Lexer(input)).parse();

    expect(actual[0]()).toBe(expected);
  });
});
