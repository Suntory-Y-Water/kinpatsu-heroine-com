import { useState, useEffect } from 'hono/jsx';

// キャラクター情報の型定義
interface Character {
  annictId: number;
  name: string;
}

interface CharacterFormProps {
  characters: Character[];
}

export default function CharacterForm({ characters }: CharacterFormProps) {
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

  function validateForm() {
    const submitButton = document.getElementById(
      'submitButton',
    ) as HTMLButtonElement;
    const imageUrl = document.querySelector(
      'input[name="imageUrl"]',
    ) as HTMLInputElement;

    if (!submitButton || !imageUrl) return;

    const isValid = selectedCharacter !== null && imageUrl.value !== '';
    submitButton.disabled = !isValid;
  }

  useEffect(() => {
    validateForm();
  }, [selectedCharacter]);

  return (
    <div>
      <div className='mb-6'>
        <label
          htmlFor='characterName'
          className='block text-primary font-medium mb-3'
        >
          キャラクター名
        </label>
        <select
          id='characterName'
          name='characterName'
          value={selectedCharacter?.name || ''}
          onChange={handleSelectCharacter}
          className='bg-background-lighter border border-border text-foreground rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary transition-colors duration-300'
          required
        >
          <option
            value=''
            className='bg-background-lighter text-foreground-muted'
          >
            キャラクターを選択してください
          </option>
          {characters.map((character) => (
            <option
              key={character.name}
              value={character.name}
              className='bg-background-lighter text-foreground'
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
