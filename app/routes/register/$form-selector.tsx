// app/islands/WorkAndCharacterSelector.tsx
import { useState } from 'hono/jsx';
import { createAnnictId } from '../../../src/domain/value_object/annict';
import type { AnnictWorkCharacters } from '../../../src/types/annict';

// 作品情報の型定義
interface Work {
  annictId: number;
  title: string;
}

// キャラクター情報の型定義
interface Character {
  annictId: number;
  name: string;
}

interface WorkAndCharacterSelectorProps {
  works: Work[];
}

export default function WorkAndCharacterSelector({
  works,
}: WorkAndCharacterSelectorProps) {
  // 検索用の状態
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 選択された作品とキャラクターの状態
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  // ローディング状態
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);

  // 検索語句変更時のハンドラー
  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredWorks([]);
    } else {
      const filtered = works.filter((work) =>
        work.title.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredWorks(filtered);
    }

    setShowSuggestions(true);
  }

  // 作品選択時の処理
  function handleSelectWork(work: Work) {
    setSelectedWork(work);
    setSearchTerm(work.title);
    setShowSuggestions(false);

    // 作品が選択されたら、キャラクター情報を取得
    fetchCharacters(work.annictId);
  }

  // キャラクター選択時の処理
  function handleSelectCharacter(e: Event) {
    const select = e.target as HTMLSelectElement;
    const characterId = Number(select.value);

    if (characterId) {
      const character =
        characters.find((c) => c.annictId === characterId) || null;
      setSelectedCharacter(character);
    } else {
      setSelectedCharacter(null);
    }
  }

  // 作品IDに基づいてキャラクター情報を取得
  async function fetchCharacters(workId: number) {
    setIsLoadingCharacters(true);
    setCharacters([]);
    setSelectedCharacter(null);

    try {
      const annictIdResult = createAnnictId(workId);
      if (annictIdResult.isErr()) {
        throw new Error(annictIdResult.error.message);
      }

      const response = await fetch(`/api/characters?workId=${workId}`);
      if (!response.ok) {
        throw new Error('キャラクターデータの取得に失敗しました');
      }

      const data: AnnictWorkCharacters = {
        data: {
          searchWorks: {
            edges: [
              {
                node: {
                  casts: {
                    edges: [
                      {
                        node: {
                          character: {
                            annictId: 35391,
                            name: 'ユエ',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35393,
                            name: 'ティオ・クラルス',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35394,
                            name: '白崎香織',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35395,
                            name: '八重樫雫',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35396,
                            name: '天之河光輝',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35397,
                            name: '畑山愛子',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35390,
                            name: '南雲ハジメ',
                          },
                        },
                      },
                      {
                        node: {
                          character: {
                            annictId: 35392,
                            name: 'シア・ハウリア',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      };

      // APIレスポンス形式に合わせてデータを変換
      const characterEdges =
        data.data.searchWorks.edges[0]?.node.casts.edges || [];
      const characterData = characterEdges.map((edge) => ({
        annictId: edge.node.character.annictId,
        name: edge.node.character.name,
      }));

      setCharacters(characterData);
    } catch (error) {
      console.error('キャラクターデータの取得エラー:', error);
      setCharacters([]);
    } finally {
      setIsLoadingCharacters(false);
    }
  }

  return (
    <div>
      {/* 作品検索フィールド */}
      <div className='mb-4 relative'>
        <label
          className='block text-gray-700 text-sm font-bold mb-2'
          htmlFor='workName'
        >
          作品名
          <span className='text-red-500 ml-1'>必須</span>
        </label>
        <input
          id='workName'
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
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
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

      {/* キャラクター選択のドロップダウン */}
      <div className='mb-4'>
        <label
          className='block text-gray-700 text-sm font-bold mb-2'
          htmlFor='characterId'
        >
          キャラクター
          <span className='text-red-500 ml-1'>必須</span>
        </label>
        <select
          id='characterId'
          name='characterId'
          onChange={handleSelectCharacter}
          disabled={!selectedWork || isLoadingCharacters}
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          required
        >
          <option value=''>キャラクターを選択してください</option>
          {characters.map((character) => (
            <option key={character.annictId} value={character.annictId}>
              {character.name}
            </option>
          ))}
        </select>

        {isLoadingCharacters && (
          <p className='text-sm text-gray-500 mt-1'>
            キャラクターを読み込み中...
          </p>
        )}

        {selectedWork && characters.length === 0 && !isLoadingCharacters && (
          <p className='text-sm text-red-500 mt-1'>
            この作品にはキャラクターが登録されていません
          </p>
        )}
      </div>
    </div>
  );
}
