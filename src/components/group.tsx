import { ReactNode } from 'react';

export enum Delimiter {
  Parenthesis,
  Bracket,
  Braces,
}

export type GroupProps = {
  delimiter?: Delimiter;
  children?: ReactNode;
  active?: boolean;
};

export const DelimiterStart = new Map([
  [Delimiter.Parenthesis, '('],
  [Delimiter.Bracket, '['],
  [Delimiter.Braces, '{'],
]);

export const DelimiterEnd = new Map([
  [Delimiter.Parenthesis, ')'],
  [Delimiter.Bracket, ']'],
  [Delimiter.Braces, '}'],
]);

export default function Group({
  children,
  delimiter = Delimiter.Parenthesis,
  active = false,
}: GroupProps) {
  return (
    <>
      {active && DelimiterStart.get(delimiter)}
      {children}
      {active && DelimiterEnd.get(delimiter)}
    </>
  );
}
