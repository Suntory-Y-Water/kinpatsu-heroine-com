import { useState, useEffect, useRef } from 'hono/jsx';

type SortOrder = 'newest' | 'likes_desc';

export interface SortOption {
  key: SortOrder;
  label: string;
}

interface SortDropdownProps {
  currentSort: SortOrder;
  options: SortOption[];
}

export default function SortDropdown({
  currentSort,
  options,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // ドロップダウン要素への参照

  const currentLabel =
    options.find((opt) => opt.key === currentSort)?.label || '並び替え';

  // ドロップダウンの外側をクリックしたときに閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    // イベントリスナーを登録
    document.addEventListener('mousedown', handleClickOutside);
    // クリーンアップ関数でイベントリスナーを削除
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]); // refが変わることは通常ないが、依存配列に含める

  return (
    <div className='relative inline-block text-left' ref={dropdownRef}>
      <div>
        <button
          type='button'
          className='inline-flex justify-center w-full rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-400 transition-colors'
          id='options-menu'
          aria-haspopup='true'
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentLabel}
          {/* 下向きの矢印アイコン */}
          <svg
            className='-mr-1 ml-2 h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      {/* ドロップダウンメニュー本体 */}
      {isOpen && (
        <div
          className='origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none border border-yellow-900/50 z-10'
          role='menu'
          aria-orientation='vertical'
          aria-labelledby='options-menu'
        >
          <div className='py-1'>
            {options.map((option) => (
              <a
                key={option.key}
                href={`/?sort=${option.key}`} // ページ番号をリセットしてソート
                className={`block px-4 py-2 text-sm transition-colors ${
                  currentSort === option.key
                    ? 'bg-yellow-400 text-black'
                    : 'text-white hover:bg-yellow-900/20 hover:text-yellow-200'
                }`}
                role='menuitem'
                onClick={() => setIsOpen(false)}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
