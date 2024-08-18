// Import testing functions:
import { describe, expect, test } from 'vitest';

// Import number functions:
import {
  mul,
  sum,
  identity,
  compoundFromValues,
  compound,
  get,
  div,
  sub,
  numToString,
  getLevel,
} from './number';

describe('Number', () => {
  describe('identity', () => {
    test('identity number should return the identity numeric value', () => {
      // Arrange:
      const expected = 16;

      // Act
      const actual = get(identity(expected)); // Get the numeric value of the identity.

      // Assert
      expect(actual).toBe(expected);
    });

    test('identity number should return its string representation', () => {
      const num = 16;
      const expected = `${16}`;

      const actual = numToString(identity(num)); // Get the string representation of the identity.

      expect(actual).toBe(expected);
    });
  });

  describe('compound number', () => {
    test('compound should return the result of the evaluated number', () => {
      const a = 16;
      const b = 21;
      const expected = a + b;

      const actual = get(compoundFromValues(a, sum, b));

      expect(actual).toBe(expected);
    });

    test('compound should evaluate the result of the expression recursively', () => {
      const a = 16;
      const b = 21;
      const c = 9;
      const expected = a + b * c;

      const actual = get(
        compound(identity(a), sum, compoundFromValues(b, mul, c)), // Here we're using a compound number inside another.
      );

      expect(actual).toBe(expected);
    });

    test('compound should return the correct string representation of an expression that not needs agroupation signs', () => {
      const a = 381;
      const b = 1958;
      const c = 69120;
      const expected = `${a} * ${b} + ${c}`;

      const actual = numToString(
        compound(compoundFromValues(a, mul, b), sum, identity(c)),
      );

      expect(actual).toBe(expected);
    });

    test('compound should return the correct string of an expression that starts with a group', () => {
      const a = 19538;
      const b = 294105;
      const c = 78522;
      const expected = `(${b} - ${c}) * ${a}`;

      // Notice that the entire subtraction is the first number of this number.
      const actual = numToString(
        compound(compoundFromValues(b, sub, c), mul, identity(a)), // String representation should automatically add parenthesis here.
      );

      expect(actual).toBe(expected);
    });

    test('compound should return the correct string of an expression that ends with a group', () => {
      const a = 19538;
      const b = 294105;
      const c = 78522;
      const expected = `${a} * (${b} - ${c})`;

      // Notice that the entire subtraction is the second number of this number.
      const actual = numToString(
        compound(identity(a), mul, compoundFromValues(b, sub, c)) // String representation should automatically add parenthesis here.
      );

      expect(actual).toBe(expected);
   })
  });

  test("should return a list of number at given depth", () => {
    const values = [62, 12, 68, 6];

    const num = compound( // 0
      identity(1459), // 1
      mul,
      compound( // 1
        compoundFromValues( // 2
          values[0], // 3
          sum,
          values[1], // 3
        ),
        div,
        compoundFromValues( // 2
          values[2], // 3
          sub,
          values[3], // 3
        ),
      ),
    )

    const nums = getLevel(num, 3);

    nums.forEach(n => {
      expect(values).toContain(get(n))
    })
  });

  test('should return an empty list if there are no numbers at given depth', () => {
    const num = compound( // 0
      compoundFromValues( // 1
        326, // 2
        mul,
        279, // 2
      ),
      sum,
      compoundFromValues( // 1
        99, // 2
        sub,
        92, // 2
      ),
    );

    const nums = getLevel(num, 3)

    expect(nums).toHaveLength(0);
  });

  test.for([
    [19, 24, 43],
    [0, 0, 0],
    [-12, 261, 249],
    [-23, -126, -149],
    // A sum with NaN should always result in NaN.
    [NaN, 2456, NaN],
    [25, NaN, NaN],
    [NaN, NaN, NaN],
  ])('%i + %i = %i', ([a, b, expected]) => {
    const actual = sum[0](a, b);

    expect(actual).toBe(expected);
  });

  test.for([
    [19, 24, -5],
    [0, 0, 0],
    [-12, 261, -273],
    [-23, -126, 103],
    // A subtraction with NaN should always result in NaN.
    [NaN, 2456, NaN],
    [25, NaN, NaN],
    [NaN, NaN, NaN],
  ])('%i - %i = %i', ([a, b, expected]) => {
    const actual = sub[0](a, b);

    expect(actual).toBe(expected);
  });

  test.for([
    [19, 24, 456],
    [0, 0, 0],
    [-12, 0, -0], // Is important to expect a negative zero here, because -12 * 0 = -0 and Vitest see 0 and -0 as different values.
    [-23, -126, 2898],
    // A multiplication with NaN should always result in NaN.
    [NaN, 2456, NaN],
    [25, NaN, NaN],
    [NaN, NaN, NaN],
  ])('%i * %i = %i', ([a, b, expected]) => {
    const actual = mul[0](a, b);

    expect(actual).toBe(expected);
  });

  test.for([
    [19, 24, 0.79166666666667],
    [-23, -126, 0.18253968253968],
    // A division with NaN should always result in NaN.
    [NaN, 2456, NaN],
    [25, NaN, NaN],
    [NaN, NaN, NaN],
  ])('%i / %i = %i', ([a, b, expected]) => {
    const actual = div[0](a, b);

    if (Number.isNaN(actual) || !Number.isFinite(actual)) {
      expect(actual).toBe(expected);
      return;
    }

    expect(actual).toBeCloseTo(expected, 6);
  });

  // Vitest converts infinity into NaN in test.each/test.for data, so we're testing this case manually.
  test('12 / 0 = infinity', () => {
    const a = 12;
    const b = 0;
    const expected = Infinity;

    const actual = div[0](a, b);

    expect(actual).toBe(expected);
  });
});
