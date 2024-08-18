/**
 * Operation is a tuple with three values: a function that takes two numbers and return one result:
 * f: Number x Number -> Number
 * the second one is another function, this function takes two strings and return a string representation
 * of the expression:
 * f: String x String -> String
 * And the priority of the operation. -1 if not operation, 0 for sums and subtraction, 1 for multiplication, etc.
 *
 * @example
 * ```
 * const sum: Operation = [(a, b) => a + b, (a, b) => `${a} + ${b}`, 0]
 * ```
 */
export type Operation = [
  apply: (a: number, b: number) => number,
  symbol: (a: string, b: string) => string,
  priority: number,
];

/**
 * Number is a tuple with three values, a functions that returns the numeric value of the Number, another for its
 * string representation, and the priority of the operation used in the number, -1 if no operation.
 *
 * @example
 * ```
 * // Create a number manually:
 * const myNum: Number = [() => 1, () => '1', -1];
 *
 * // Or use a helper function:
 * const myIdentity = identity(1);
 * const myCompound = compound(2, mul, 2);
 * ````
 */
export type Number = [
  number: () => number,
  string: () => string,
  operationPriority: number,
  left: Number | null,
  right: Number | null,
];

/**
 * get is a handy way to get the numeric value of a object of type {@link Number}.
 *
 * @example
 * ```
 * const myIdentity = identity(16);
 *
 * // Instead of write:
 * const value = myIdentity[0](); // 16
 *
 * // Just use:
 * const value = get(myIdentity); // 16
 * ```
 */
export const get = (num: Number): number => num[0]();

/**
 * numToString is a handy way to get the string representation of a object of type {@link Number}.
 *
 * @example
 * ```
 * const myIdentiy = identity(16);
 *
 * // Instead of write:
 * const value = myIdentity[1](); // "16"
 *
 * // Just write:
 * const value = numToString(myIdentity); // "16"
 * ```
 */
export const numToString = (num: Number): string => num[1]();

export const getLevel = (num: Number | null, level: number): Number[] => {
  if (!num) return [];
  if (level <= 0) return [num];

  return [...getLevel(num[3], level - 1), ...getLevel(num[4], level - 1)];
};

/**
 * getDepth get the level of most nested numbers inside num, the returned level will contain only identity numbers.
 *
 * @example
 * ```
 * const num = compound( // 0
 *   identity(24), // 1
 *   mul,
 *   compoundFromValues( // 1
 *     128, // 2
 *     sum,
 *     254 // 2
 *   )
 * );
 *
 * const depth = getDepth(num);
 *
 * console.log(depth) // 2
 * ```
 *
 * @remarks
 * A null number will return -1.
 */
export const getDepth = (num: Number | null, level: number = -1): number => {
  if (!num) return level;

  return Math.max(
    getDepth(num[3], level + 1), // Left's depth
    getDepth(num[4], level + 1), // Right's depth
  );
};

/**
 * Identity is a helper to create a simple number without an {@link Operation}.
 *
 * @param a - the number to be used as numeric value, the string representation will be `${a}`;
 *
 * @example
 * ```
 * const myIdentity = identity(16);
 * ```
 */
export const identity = (a: number): Number => {
  return [() => a, () => `${a}`, -1, null, null];
};

/**
 * compound is a helper for creating a number derivated from a and b with an {@link Operation}.
 *
 * @param a - The left operand.
 * @param o - The operation between a and b.
 * @param b - The right operand.
 *
 * @example
 * ```
 * const myCompound = compound(identity(16), mul, identity(8));
 * ```
 */
export const compound = (a: Number, o: Operation, b: Number): Number => [
  () => o[0](get(a), get(b)),
  () => {
    // If `b` is not a simple number and its priority is less than the current one then
    // add parenthesis around `b`, ex. a = 16, b = 12 + 2, a * b -> a * (b) = a * (12 + 2).
    if (b[2] !== -1 && b[2] < o[2]) {
      return o[1](numToString(a), `(${numToString(b)})`);
    }

    // If `a` is not a simple number and its priority  is less than the current one then
    // add parenthesis around `a`, ex. a = 27 + 9, b = 5, a * b -> (a) * b = (27 + 9) * 5.
    if (a[2] !== -1 && a[2] < o[2]) {
      return o[1](`(${numToString(a)})`, numToString(b));
    }

    // If both `a` and `b` are simple numbers or have the same priority just pass as they are. ex a = 16, b 9, a + b = 16 + 9.
    return o[1](numToString(a), numToString(b));
  },
  o[2],
  a,
  b,
];

/**
 * compoundFromValues is a shortcut for creating a compound number, allowing to creating one using directly the numeric value.
 *
 * @param a - The left operand.
 * @param o - The operation.
 * @param b - The right operand.
 *
 * @example
 * ```
 * // Instead of writting this:
 * const myCompound = compound(identity(8), mul, identity(10));
 *
 * // You can just write:
 * const myCompound = compoundFromValues(8, mul, 10);
 * ```
 */
export const compoundFromValues = (
  a: number,
  o: Operation,
  b: number,
): Number => compound(identity(a), o, identity(b));

/**
 * sum represents a sum {@link Operation}.
 */
export const sum: Operation = [(a, b) => a + b, (a, b) => `${a} + ${b}`, 0];

/**
 * sub represents a subtraction {@link Operation}.
 */
export const sub: Operation = [(a, b) => a - b, (a, b) => `${a} - ${b}`, 0];

/**
 * mul is a multiplication {@link Operation}.
 */
export const mul: Operation = [(a, b) => a * b, (a, b) => `${a} * ${b}`, 1];

/**
 * div is a division {@link Operation}.
 */
export const div: Operation = [(a, b) => a / b, (a, b) => `${a} / ${b}`, 1];
