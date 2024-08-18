import { useEffect, useState } from 'react';
import { Parser } from '../number/parser';
import { Lexer } from '../number/lexer';
import { Number } from '../number/number';

export type InsertNumberProps = {
  setNumber: (num: Number) => void;
  disabled?: boolean;
};

export default function InsertNumber({
  setNumber,
  disabled,
}: InsertNumberProps) {
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const parser = new Parser(new Lexer(input));

    try {
      setNumber(parser.parse());
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }, [input]);

  return (
    <form className='w-full h-full flex flex-col'>
      {invalid && <label>Invalid expression</label>}
      <input
        disabled={disabled}
        type='text'
        value={input}
        className='border-neutral-400 border-solid border-2 rounded px-2'
        onChange={e => setInput(e.target.value)}></input>
    </form>
  );
}
