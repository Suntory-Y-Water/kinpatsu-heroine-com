import { createRoute } from 'honox/factory';
import { CharacterCard } from '../components/character/CharacterCard';

// 仮のデータ
const MOCK_CHARACTERS = [
  {
    id: '1',
    name: 'アリス・シンセシス・サーティ',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'ソードアート・オンライン アリシゼーション',
    likes: 1234,
  },
  {
    id: '2',
    name: 'ヴァイオレット・エヴァーガーデン',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'ヴァイオレット・エヴァーガーデン',
    likes: 3456,
  },
  {
    id: '3',
    name: 'セイバー',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'Fate/stay night',
    likes: 5678,
  },
  {
    id: '4',
    name: 'ダークネス',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'この素晴らしい世界に祝福を！',
    likes: 2345,
  },
  {
    id: '5',
    name: 'マーニー',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: '思い出のマーニー',
    likes: 4567,
  },
  {
    id: '6',
    name: 'シャーロット・デュノア',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'インフィニット・ストラトス',
    likes: 3789,
  },
];

export default createRoute((c) => {
  // 本来はuseStateなどで管理するところだが、レイアウト固定のため省略
  // 表示するのは最初の4件
  const characters = MOCK_CHARACTERS.slice(0, 4);
  const currentPage = 1;
  const totalPages = Math.ceil(MOCK_CHARACTERS.length / 4);
  const sortByLikes = false;

  return c.render(
    <div className='space-y-8'>
      {/* ソートボタン */}
      <div className='flex justify-end'>
        <button
          type='button'
          className='flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-yellow-900/30 hover:bg-yellow-900/20 transition-colors text-[#FFFDE7]'
        >
          <span className='text-[#FFFDE7]'>⇅</span>
          <span>いいね{sortByLikes ? '昇順' : '降順'}</span>
        </button>
      </div>

      {/* キャラクターグリッド */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto'>
        {characters.map((character) => (
          <CharacterCard key={character.id} {...character} />
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-2 mt-8 flex-wrap'>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              type='button'
              key={page}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${
                  currentPage === page
                    ? 'bg-[#F3DB5F] text-black font-bold'
                    : 'text-[#FFFDE7] hover:bg-yellow-900/20'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>,
  );
});
