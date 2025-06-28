import { useEffect } from 'hono/jsx/dom';

export interface SortOption {
  key: string;
  label: string;
}

interface SortSelectorProps {
  currentSort: string;
  options: SortOption[];
}

export function SortSelector({ currentSort, options }: SortSelectorProps) {
  useEffect(() => {
    const select = document.querySelector('select[name="sort"]');
    if (select && select instanceof HTMLSelectElement) {
      select.value = currentSort;
    }
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
      <div className='relative inline-block text-left group'>
        <select
          name='sort'
          defaultValue={currentSort}
          onChange={handleChange}
          className='inline-flex justify-center w-full rounded-full border border-border shadow-lg px-6 py-3 bg-background-light text-base font-medium text-foreground hover:bg-background-lighter hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 appearance-none cursor-pointer transform hover:scale-105'
        >
          {options.map((option) => (
            <option
              key={option.key}
              value={option.key}
              className='bg-background-light text-foreground py-2'
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary group-hover:text-primary-light transition-colors duration-300'>
          <svg
            className='h-5 w-5 transform group-hover:rotate-180 transition-transform duration-300'
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
