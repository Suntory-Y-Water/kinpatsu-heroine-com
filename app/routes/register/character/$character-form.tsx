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
    const characterId = Number(select.value);

    if (!characterId) {
      setSelectedCharacter(null);
      return;
    }

    setSelectedCharacter(
      characters.find((c) => c.annictId === characterId) || null,
    );
  }

  return (
    <div>
      <div className='mb-4'>
        <label htmlFor='characterId' className='block text-white mb-2'>
          キャラクター名
        </label>
        <select
          id='characterId'
          name='characterId'
          value={selectedCharacter?.annictId || ''}
          onChange={handleSelectCharacter}
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
      </div>
    </div>
  );
}
