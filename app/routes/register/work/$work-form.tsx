import { useState, useEffect } from 'hono/jsx';

// 作品情報の型定義
interface Work {
  annictId: number;
  title: string;
}

interface WorkFormProps {
  works: Work[];
}

export default function WorkForm({ works }: WorkFormProps) {
  // 検索用の状態
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 選択された作品とキャラクターの状態
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // 検索語句変更時のハンドラー
  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setSearchTerm(value);

    setShowSuggestions(true);

    if (!value.trim()) {
      setFilteredWorks([]);
      return;
    }

    const filtered = works.filter((work) =>
      work.title.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredWorks(filtered);
  }

  // 作品選択時の処理
  function handleSelectWork(work: Work) {
    setSelectedWork(work);
    setSearchTerm(work.title);
    setShowSuggestions(false);
  }

  function validateForm() {
    const submitButton = document.getElementById(
      'submitButton',
    ) as HTMLButtonElement;

    if (!submitButton) return;

    submitButton.disabled = selectedWork === null;
  }

  useEffect(() => {
    validateForm();
  }, [selectedWork]);

  return (
    <div>
      {/* 作品検索フィールド */}
      <div className='mb-6 relative'>
        <label
          htmlFor='workName'
          className='block text-yellow-300 font-medium mb-3'
        >
          作品名
        </label>
        <input
          id='workName'
          name='workName'
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // すぐに非表示にすると選択できないので遅延
            setTimeout(() => {
              setShowSuggestions(false);
            }, 200);
          }}
          className='w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:border-yellow-400 transition-colors duration-300'
          placeholder='作品名を入力してください'
          required
        />

        {/* 隠しフィールドで選択された作品IDを保持 */}
        <input
          type='hidden'
          name='workId'
          value={selectedWork?.annictId || ''}
        />

        {/* 作品候補のドロップダウン */}
        {showSuggestions && filteredWorks.length > 0 && (
          <ul className='absolute z-10 mt-2 w-full bg-gray-700 border border-yellow-400 rounded-lg shadow-2xl max-h-60 overflow-auto'>
            {filteredWorks.map((work) => (
              <li
                key={work.annictId}
                className='px-4 py-3 text-white hover:bg-gray-600 hover:text-yellow-300 cursor-pointer transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg'
                onClick={() => {
                  handleSelectWork(work);
                }}
                onKeyDown={() => {
                  handleSelectWork(work);
                }}
              >
                {work.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
