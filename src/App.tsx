import { twMerge } from 'tailwind-merge';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { IoMdSunny, IoIosMoon } from 'react-icons/io';
import NumberValue from './components/numberValue';
import InsertNumber from './components/insertNumber';
import { getDepth, identity, Number } from './number/number';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState('');
  const [num, setNum] = useState(identity(0));
  const [solving, setSolving] = useState(false);
  const [step, setStep] = useState(getDepth(num));
  const [id, setId] = useState(0);

  const numberValues = useMemo(
    () => Array.from(Array(getDepth(num) + 1 - step)),
    [num, step],
  );

  useEffect(() => {
    const onLocationChange = () => {
      setPage(window.location.hash);
    };

    window.addEventListener('popstate', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  const handleSetNum = (num: Number) => {
    setStep(getDepth(num));
    setNum(num);
  };

  useEffect(() => {
    if (!solving) return;

    setStep(getDepth(num));

    setId(
      setInterval(() => {
        setStep(step => step - 1);
      }, 1000),
    );

    return () => clearInterval(id);
  }, [solving]);

  useEffect(() => {
    if (step <= 0) {
      setSolving(false);
      clearInterval(id);
    }
  }, [step]);

  return (
    <main
      className={twMerge(
        darkMode && 'dark',
        'w-screen h-screen bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-100 flex flex-col',
      )}>
      <nav className='relative flex p-2 bg-none border-neutral-300 dark:border-gray-800 border-solid border-b-2 w-full justify-between items-center'>
        <h1 className='font-bold text-2xl'>
          <a href='/'>Jerarquía de Operaciones</a>
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className='text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          {darkMode ? <IoIosMoon /> : <IoMdSunny />}
        </button>

        <button className='rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1 hover:bg-neutral-700 dark:hover:bg-neutral-300'>
          <a
            className='text-xl font-bold'
            href='/jerarquia-de-operaciones/#about'>
            Más Información
          </a>
        </button>
      </nav>
      <section className='w-full flex-grow'>
        {page === '#about' && (
          <div className='w-full h-full grid place-items-center'>
            <div className='leading-8 w-1/3 flex flex-col gap-3'>
              <h2 className='text-3xl font-bold'>Sobre mi</h2>
              <p>
                Esta página fue hecha por{' '}
                <span className='font-bold'>Alejandro Paz Gómez</span> en 2024.
              </p>
              <a
                href='https://github.com/KytnaCode'
                className='text-2xl self-center'>
                <FaGithub />
              </a>
            </div>
          </div>
        )}
        {page === '' && (
          <div className='w-full h-full grid place-items-center'>
            <div className='w-1/3 h-1/2 grid justify-evenly items-center'>
              {numberValues.map((_, i) => (
                <NumberValue
                  num={num}
                  resolvedLevel={getDepth(num) - i}
                  key={i}
                />
              ))}
              <InsertNumber disabled={solving} setNumber={handleSetNum} />
              <button
                onClick={() => setSolving(true)}
                className='rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1 hover:bg-neutral-700 dark:hover:bg-neutral-300'>
                Resolver
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
