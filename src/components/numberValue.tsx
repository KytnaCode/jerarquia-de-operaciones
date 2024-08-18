import { useMemo } from 'react';
import { getDepth, Number } from '../number/number';
import { twMerge } from 'tailwind-merge';
import Group from './group';

export type NumberValueProps = {
  /**
   * The represented number.
   */
  num: Number;

  /**
   * How many depth levels are solved.
   */
  resolvedLevel?: number;
};

const levelColor = new Map([
  [0, 'bg-neutral-300 dark:bg-neutral-600'],
  [1, 'bg-blue-300 dark:bg-blue-600'],
  [2, 'bg-green-300 dark:bg-green-600'],
]);

/**
 * NumberValue renders a number with colored groups.
 */
export default function NumberValue({
  num,
  resolvedLevel = getDepth(num), // The last level is getDepth(num) - 1, so none of the expressions are solved.
}: NumberValueProps) {
  return <RecursiveNumber num={num} level={0} resolved={resolvedLevel} />;
}

/**
 * Renders a number recursively
 */
export function RecursiveNumber({
  num,
  level,
  resolved,
}: {
  num: Number;
  level: number;
  resolved: number;
}) {
  const left = useMemo(() => num[3], [num]);
  const right = useMemo(() => num[4], [num]);

  // If there is a left node and its operation has less priority than the current number then group the left operand.
  const leftGroup = useMemo(
    () => (left?.[2] && num?.[2] && left[2][2] < num[2][2]) ?? undefined,
    [left, num],
  );

  // If there is a right node and its operation has less priority than the current number then group the right operand.
  const rightGroup = useMemo(
    () => (right?.[2] && num?.[2] && right[2][2] < num[2][2]) ?? undefined,
    [right, num],
  );

  const color = useMemo(() => levelColor.get(level % 3)!, []);

  // If the numbers is an identity.
  if (!left || !right) {
    return <span key={`identity-${Date.now()}`}>{num[1]()}</span>;
  }

  // Resolve the number.
  if (resolved <= level) {
    return (
      <span className={twMerge('py-1 px-2 rounded-xl', color)}>{num[0]()}</span>
    );
  }

  return (
    <div className={twMerge('inline-block px-2 py-2 rounded-xl', color)}>
      <div className='inline-block'>
        <Group active={leftGroup}>
          {' '}
          {/* left operand */}
          <RecursiveNumber num={left} level={level + 1} resolved={resolved} />
        </Group>
      </div>
      <span>{[num[2]?.[1]('', '')]}</span> {/* operation symbol */}
      <div className='inline-block'>
        <Group active={rightGroup}>
          {' '}
          {/* right operand */}
          <RecursiveNumber num={right} level={level + 1} resolved={resolved} />
        </Group>
      </div>
    </div>
  );
}
