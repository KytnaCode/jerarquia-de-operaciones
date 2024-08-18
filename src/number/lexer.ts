import { isNumber } from "./util";

/**
  * TokenType enumerates all possible tokens
  */
export enum TokenType {
  Illegal = 'Illegal', // An unexpected token.
  EOF = 'EOF', // End of Content Token.

  // Grouping symbols.
  StartParenthesis = '(',
  StartBracket = '[',
  StartBrace = '{',
  EndParenthesis = ')',
  EndBracket = ']',
  EndBrace = '}',

  // Values
  Number = 'Number',

  // Operations
  Sum = '+',
  Sub = '-',
  Mul = '*',
  Div = '/',

  // Comparation
  Equal = '=',
  EqualOrGreaterThan = '>=',
  EqualOrLessThan = '<=',
  LessThan = '<',
  GreaterThan = '>',
  Similar = '~',
}

/**
  * TokenString map strings with their respective {@link TokenType}.
  */
export const TokenString = new Map([
  // EOF
  ['EOF', TokenType.EOF],

  // Grouping Symbols.
  ['(', TokenType.StartParenthesis],
  ['[', TokenType.StartBracket],
  ['{', TokenType.StartBrace],
  [')', TokenType.EndParenthesis],
  [']', TokenType.EndBracket],
  ['}', TokenType.EndBrace],

  // Operations
  ['+', TokenType.Sum],
  ['-', TokenType.Sub],
  ['*', TokenType.Mul],
  ['/', TokenType.Div],

  // Comparation
  ['=', TokenType.Equal],
  ['<', TokenType.LessThan],
  ['>', TokenType.GreaterThan],
  ['<=', TokenType.EqualOrLessThan],
  ['>=', TokenType.EqualOrGreaterThan],
  ['~', TokenType.Similar],
]);

/**
  * ComparationSymbols contains all one character symbols used for comparation. Compound symbols like '<=' or '>=' are not included.
  */
export const ComparationSymbols = [
  TokenType.Equal, // =
  TokenType.LessThan, // <
  TokenType.GreaterThan, // >
  TokenType.Similar, // ~
];

/**
  * Token represents a lexer's token, it has two values, Token[0] is the {@link TokenType} of the token and Token[1] is its string
  * value.
  */
export type Token = [TokenType, string];

/**
 * newToken creates a new {@link Token} with the specified type and value.
 *
 * @param type - The new token's type: Token[0].
 * @param value - The new token's value: Token[1].
 */
export function newToken(type: TokenType, value: string): Token {
    return [type, value];
}

/**
  * Lexer converts the input expression into tokens of type {@link Token}.
  *
  * @example
  * ``` 
  * const lexer = new Lexer("1 + 2");
  *
  * const tokens = [];
  * 
  * while (true) {
  *   const token = lexer.nextToken();
  *
  *   if (token[0] === TokenType.EOF) {
  *     break;
  *   }
  *   
  *  tokens.push(token); 
  * } 
  *
  * console.log(tokens); // [ [ 'Number', '1' ], [ '+', '+' ], [ 'Number', '2' ] ] 
  */
export class Lexer {
  input: string; // Input expression.
  position = 0; // Points to the current character.
  readPosition = 0; // One character ahead of position.
  char: string = String.fromCharCode(0); // NUL character.
  line = 0; // For better error reporting.

  /**
    * Creates a new {@link Lexer}.
    *
    * @param expression - the mathematical expression to tokenize.
    */
  constructor(expression: string) {
    this.input = expression;

    this.readChar(); // Prepare `this.char` and `this.readPosition` values.
  }

  /**
    * readChar set `this.char` to the next character, and increment `this.position` and `this.readPosition`.
    *
    * When reach the end of content set `this.char` to `TokenType.EOF`.
    */
  private readChar() {
    if (this.readPosition >= this.input.length) { // If reached input's end.
      this.char = TokenType.EOF;
    } else {
      this.char = this.input.charAt(this.readPosition);
    }

    this.position = this.readPosition;
    this.readPosition++;
  }

  /**
    * peekChar returns the next input's character without modifying `this.char`, `this.position` nor `this.readPosition`.
    */
  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return TokenType.EOF;
    }

    return this.input.charAt(this.readPosition);
  }

  /**
    * lastChar returns the character just before `this.position` including whitespaces.
    */
  private lastChar(): string {
    if (this.position === 0) {
      return String.fromCharCode(0); // NUL character
    }

    return this.input.charAt(this.position - 1);
  }

  /**
   * readComparation return a string of comparation symbols from the current `this.position`. This function support multi-symbol
   * comparations like '>=' or '<='.
   *
   * Can read undefined comparators like '>>', '><' or '=~', but if the comparator is not in @{link TokenType} enum
   * its token type will be `TokenType.Illegal`.
   */
  private readComparation(): string {
    const position = this.position; // Start position.
    let nextType = TokenString.get(this.peekChar());

    while (nextType && ComparationSymbols.includes(nextType)) {
      // Check if the next character is a comparation symbol.
      this.readChar();
      nextType = TokenString.get(this.peekChar());
    }

    return this.input.slice(position, this.readPosition);
  }
  
  /**
    * readTokenType read one character tokens.
    *
    * If there is a '+' or '-' symbols with a number on the right and without a number on the left, then it will be
    * tokenized as a signed number, not an operation.
    */
  private readTokenType(): string {
    if (this.isSignedNumber()) {
      return this.readNumber(); // Read as a signed number.
    }

    return this.char;
  }

  /**
    * isSignedNumber returns true is there are a number just next to a '+' or '-' symbol and the symbol does not have a number before.
    */
  private isSignedNumber(): boolean {
    return (this.char === '+' || this.char === '-') &&
      isNumber(this.peekChar()) &&
      !isNumber(this.lastChar());
  }

  /**
   * readNumber return a string of all characters that are part of a number from `this.position` until the first non-number
   * character.
   */
  private readNumber(): string {
    const position = this.position; // Start position;

    while (isNumber(this.peekChar())) {
      this.readChar();
    }

    return this.input.slice(position, this.readPosition);
  } 

  /**
   * SkipWhitespace set `this.char` to the next non whitespace character
   */
  private skipWhitespace() {
    while (
      this.char === ' ' || // Spaces.
      this.char === '\n' || // New lines.
      this.char === '\t' || // Tabs.
      this.char === '\r' // Carriage return.
    ) {
      if (this.char === '\n') {
        this.line++;
      }

      this.readChar(); // Advance to the next character.
    }
  }

  /**
   * nextToken returns a token representing the next meanful value in the lexer's input.
   */
  public nextToken(): Token {
    this.skipWhitespace();

    let tokenType = TokenString.get(this.char);
    let value = this.char;

    if (tokenType && ComparationSymbols.includes(tokenType)) {
      // If the character is a comparation.
      value = this.readComparation();
      tokenType = TokenString.get(value);
    } else if (tokenType) {
      // If is a single character token, like '{', ']' or '+'. 
      if (this.isSignedNumber()) {
        tokenType = TokenType.Number;
      }

      value = this.readTokenType();
    } else if (isNumber(this.char)) {
      // If is a number literal.
      value = this.readNumber();
      tokenType = value === '' ? TokenType.Illegal : TokenType.Number;
    }

    this.readChar(); // Advance to the next character.

    return newToken(tokenType ?? TokenType.Illegal, value);
  }

  /**
   * getLine returns the current lexer's scanning for line.
   */
  public getLine(): number {
    return this.line;
  }
}
