// app/islands/WorkAndCharacterSelector.tsx
import { useState } from 'hono/jsx';

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

  return (
    <div>
      {/* 作品検索フィールド */}
      <div className='mb-4 relative'>
        <label htmlFor='workName' className='block text-[#FFFDE7] mb-2'>
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
          className='w-full bg-[#1A1F2C] border border-gray-700 rounded p-2 text-[#FFFDE7]'
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
          <ul className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto'>
            {filteredWorks.map((work) => (
              <li
                key={work.annictId}
                className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
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
