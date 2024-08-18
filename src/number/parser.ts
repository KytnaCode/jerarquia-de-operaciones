import { ILexer, Token, TokenType } from './lexer';
import {
  compound,
  div,
  identity,
  mul,
  sub,
  sum,
  type Number as NumberTree,
} from './number';

/**
  * Operations map each operation @{link TokenType} to its operation function.
  */
export const Operations = new Map([
  [TokenType.Sum, sum],
  [TokenType.Sub, sub],
  [TokenType.Mul, mul],
  [TokenType.Div, div],
]);

/**
  * GroupDelimiters map each group start symbol with its respective end symbol.
  */
export const GroupDelimiters = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
]);

/**
  * Parser converts a mathematical expression into a @{link Number} type.
  *
  * @example
  * ```
  * const parser = new Parser(new Lexer("19 + 21"));
  *
  * const num = parser.parse();
  *
  * console.log(num[0]); // 40;
  * ```
  */
export class Parser {
  lexer; // The internal lexer.
  last: NumberTree | undefined; // Last number parsed.
  token: Token; // The current token.
  peekToken: Token; // The token next to the current token.

  /**
    * Creates a new parser on base a lexer.
    */
  constructor(lexer: ILexer) {
    this.lexer = lexer;

    this.token = this.lexer.nextToken(); // set `token` to the first token.
    this.peekToken = this.lexer.nextToken(); // and `peekToken` to the second one.
  }

  /**
    * Advance to the next token.
    *
    * modifies `token` and `peekToken`.
    */
  private nextToken() {
    this.token = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  /**
    * parseNumber create a {@link Number} from the the parser's current token.
    */
  private parseNumber(): NumberTree {
    const num = identity(Number(this.token[1]));

    return num;
  }

  /** 
    * parseExpression create an @{link Number} from an expression.
    * 
    * @remarks
    * ```
    * <expression> ::= <expression> <operation> <expression> | <group-start> <expression> <group-end> | <number>
    * <operation> ::= "+" | "-" | "*" | "/"
    * <group-start> ::= "(" | "[" | "{"
    * <group-end> ::= ")" | "]" | "}"                    
    * ```
    */
  private parseExpression(last: NumberTree | undefined): NumberTree {
    if (!last) { // If is a simple number.
      return this.parseNumber(); 
    }

    const operation = Operations.get(this.token[0]);

    if (!operation) {
      throw new Error(`expected an operation got: ${this.token[0]}`);
    }

    this.nextToken();

    if (Array.from(GroupDelimiters.keys()).includes(this.token[1])) { // If the next element is a group.
      return compound(last, operation, this.parseGroup()); // ex. 16 + ( ... ).
    }

    const nextNum = this.parseExpression(undefined); // Check for the next number.

    const nextOperation = Operations.get(this.peekToken[0]);

    if (nextOperation && nextOperation[2] > operation[2]) { // If the next operation's priority of the next expression is greater.
      this.nextToken(); // Advance to make `this.char` to be an operation.
      return compound(last, operation, this.parseExpression(nextNum)); // ex. 17 + 16 * 21 = 17 + (16 * 21).
    }

    // If the next expression is a simple number or has the same priority that the current one.
    return compound(last, operation, this.parseNumber()); // ex. 16 + 21.
  }

  /**
    * parseGroup returns a {@link Number} from the expression inside groupping symbols
    * 
    * @remarks
    * a group ends only when the expected delimiter is reached. If there is no delimiter then parser will throw an error.
    * 
    * ```
    * "(" -> ")"
    * "[" -> "]"
    * "{" -> "}"
    * ``` 
    */
  private parseGroup(): NumberTree {
    const delimiter = GroupDelimiters.get(this.token[1]); // Get the respective end symbol.

    if (!delimiter) {
      throw new Error(
        `could not parse group, unknown symbol: ${this.token[1]}`,
      );
    }

    this.nextToken(); // Advance to the start of the expression.

    let groupNum: NumberTree | undefined; // The first number in the expression.

    while (true) {
      if (this.token[1] === delimiter) { // Stop when reached the delimiter.
        break;
      }

      groupNum = this.parseExpression(groupNum);
      this.nextToken();
    }

    if (!groupNum) {
      throw new Error(`could not parse group: undefined result`);
    }

    return groupNum;
  }

  /**
    * parseValue calls the apropiate parse function on base the current token.
    */
  private parseValue(): NumberTree {
    if (Array.from(GroupDelimiters.keys()).includes(this.token[1])) {
      return this.parseGroup();
    }

    return this.parseExpression(this.last);
  }

  /**
    * parse return an tuple of type {@link Number} representing the lexer's mathematical expression.
    */
  public parse(): NumberTree {
    while (true) {
      if (this.token[0] === TokenType.EOF) {
        break;
      }

      this.last = this.parseValue();
      this.nextToken();
    }

    if (!this.last) {
      throw new Error('could not parse input: result is undefined');
    }

    return this.last;
  }
}
