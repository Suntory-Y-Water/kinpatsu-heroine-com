import { useState } from 'hono/jsx';

// キャラクター情報の型定義
interface Character {
  annictId: number;
  name: string;
}

interface CharacterFormProps {
  characters: Character[];
}

export default function CharacterForm({ characters }: CharacterFormProps) {
  // 選択された作品とキャラクターの状態

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  function handleSelectCharacter(e: Event) {
    const select = e.target as HTMLSelectElement;
    const characterName = select.value;

    if (characterName === '') {
      setSelectedCharacter(null);
      return;
    }

    setSelectedCharacter(
      characters.find((c) => c.name === characterName) || null,
    );
  }

  return (
    <div>
      <div className='mb-4'>
        <label htmlFor='characterName' className='block text-white mb-2'>
          キャラクター名
        </label>
        <select
          id='characterName'
          name='characterName'
          value={selectedCharacter?.name || ''}
          onChange={handleSelectCharacter}
          className='bg-gray-800 border border-gray-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent'
          required
        >
          <option value='' className='bg-gray-800 text-gray-400'>
            キャラクターを選択してください
          </option>
          {characters.map((character) => (
            <option
              key={character.name}
              value={character.name}
              className='bg-gray-800 text-white'
            >
              {character.name}
            </option>
          ))}
        </select>
        {/* 隠しフィールドでキャラクターIDを保持 */}
        <input
          type='hidden'
          name='characterId'
          value={selectedCharacter?.annictId || ''}
        />
      </div>
    </div>
  );
}
