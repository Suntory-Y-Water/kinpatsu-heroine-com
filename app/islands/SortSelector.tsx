import { useState, useEffect } from 'hono/jsx';

export interface SortOption {
  key: string;
  label: string;
}

interface SortSelectorProps {
  currentSort: string;
  options: SortOption[];
}

export function SortSelector({ currentSort, options }: SortSelectorProps) {
  const [selectedSort, setSelectedSort] = useState(currentSort);

  useEffect(() => {
    setSelectedSort(currentSort);
  }, [currentSort]);

  function handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const form = select.form;
    if (form) {
      form.submit();
    }
  }

  return (
    <form method='get' action='' className='flex justify-end'>
      <div className='relative inline-block text-left'>
        <select
          name='sort'
          value={selectedSort}
          onChange={handleChange}
          className='inline-flex justify-center w-full rounded-md border border-gray-700 shadow-sm px-6 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-300 transition-colors appearance-none'
        >
          {options.map((option) => (
            <option
              key={option.key}
              value={option.key}
              className='bg-gray-800 text-white'
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
          <svg
            className='h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            title='ドロップダウン矢印'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      </div>
    </form>
  );
}
