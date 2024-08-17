import { describe, expect, test } from 'vitest';
import { Lexer, TokenType, Token } from './lexer';

describe('Lexer', () => {
  test('should return an EOF character', () => {
    const expected = TokenType.EOF;

    const lexer = new Lexer('');

    expect(lexer.nextToken()[0]).toBe(expected);
  });

  test.each([
    ['12', TokenType.Number, '12', 'Number'],
    ['+', TokenType.Sum, '+', 'Sum'],
    ['-', TokenType.Sub, '-', 'Subtraction'],
    ['*', TokenType.Mul, '*', 'Multiplication'],
    ['/', TokenType.Div, '/', 'Division'],
    ['(', TokenType.StartParenthesis, '(', 'Start Parenthesis'],
    ['[', TokenType.StartBracket, '[', 'Start Bracket'],
    ['{', TokenType.StartBrace, '{', 'Start Brace'],
    [')', TokenType.EndParenthesis, ')', 'End Parenthesis'],
    [']', TokenType.EndBracket, ']', 'End Bracket'],
    ['}', TokenType.EndBrace, '}', 'End Brace'],
    ['=', TokenType.Equal, '=', 'Equal'],
    ['>=', TokenType.EqualOrGreaterThan, '>=', 'Equal or greather than'],
    ['<=', TokenType.EqualOrLessThan, '<=', 'Equal or less than'],
    ['>', TokenType.GreaterThan, '>', 'Greater than'],
    ['<', TokenType.LessThan, "<", 'Less than'],
    ['~', TokenType.Similar, "~", 'Similar'],
  ])(
    "'%s' should return a token of type '%s', value %s and name '%s'",
    (text, expectedType, expectedValue) => {
      const lexer = new Lexer(text);

      const t = lexer.nextToken();

      expect(t[0]).toBe(expectedType);
      expect(t[1]).toBe(expectedValue);
    },
  );

  test.each([
    ['12 + 3', 3],
    ['9 * (2 - 1)', 7],
    ['123', 1],
    ['()', 2],
    ['9 * 9 * 9', 5],
    ['{ 10 + [ 5 + ( 2 + 1 ) ] }', 13],
    // No space separated values should work also.
    ['12+3', 3],
    ['9*(2-1)', 7],
    ['9*9*9', 5],
    ['{10+[5+(2+1)]}', 13]
  ])('"%s" input should return %i amount of tokens', (input, expected) => {
    const lexer = new Lexer(input);

    const tokens: Token[] = [];

    while (true) {
      const token = lexer.nextToken();

      if (token[0] === TokenType.EOF) {
        break;
      }

      tokens.push(token);
    }

    expect(tokens).toHaveLength(expected);
  });

  test.each([
    [0],
    [1],
    [2],
    [3],
    [4],
  ])("should return %i lines", (lines) => {
    const input = "\n".repeat(lines);

    const lexer = new Lexer(input)

    for (let i = 0; i <= lines; i++) {
      lexer.nextToken();
    }

    expect(lexer.getLine()).toBe(lines);
  })
});
