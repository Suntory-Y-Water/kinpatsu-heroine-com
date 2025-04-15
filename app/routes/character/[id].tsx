import { createRoute } from 'honox/factory';
import { CharacterCard } from '../../components/character/CharacterCard';

interface StreamingService {
  name: string;
  url: string;
}

interface Character {
  id: string;
  name: string;
  image: string;
  animeName: string;
  likes: number;
  description: string;
  as: {
    official: string;
    wikipedia: string;
  };
  streamingServices: StreamingService[];
}

// 仮のデータマップ
const MOCK_CHARACTERS: Record<string, Character> = {
  '1': {
    id: '1',
    name: 'アリス・シンセシス・サーティ',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'ソードアート・オンライン アリシゼーション',
    likes: 1234,
    description:
      'アンダーワールドに住む整合騎士。記憶を失った状態で目覚めるが、キリトとの出会いを経て、自分の使命と向き合っていく。',
    as: {
      official: 'https://sao-alicization.net/',
      wikipedia: 'https://ja.wikipedia.org/wiki/ソードアート・オンライン',
    },
    streamingServices: [
      { name: 'Netflix', url: 'https://www.netflix.com' },
      { name: 'Crunchyroll', url: 'https://www.crunchyroll.com' },
      { name: 'Amazon Prime', url: 'https://www.amazon.com/prime' },
    ],
  },
  '2': {
    id: '2',
    name: 'ヴァイオレット・エヴァーガーデン',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'ヴァイオレット・エヴァーガーデン',
    likes: 3456,
    description:
      '戦争で両腕を失い、義手となった少女。自動手記人形として手紙を代筆する仕事をしながら、かつての上官から告げられた「愛してる」という言葉の意味を探す旅に出る。',
    as: {
      official: 'https://violet-evergarden.jp/',
      wikipedia:
        'https://ja.wikipedia.org/wiki/ヴァイオレット・エヴァーガーデン',
    },
    streamingServices: [{ name: 'Netflix', url: 'https://www.netflix.com' }],
  },
  '3': {
    id: '3',
    name: 'セイバー',
    image: 'https://arifureta.com/wp3/wp-content/uploads/2024/10/03-63.jpg',
    animeName: 'Fate/stay night',
    likes: 5678,
    description:
      '第五次聖杯戦争において士郎のサーヴァントとして召喚された。本名はアルトリア・ペンドラゴン、かつてブリテンを治めた「アーサー王」の真の姿。',
    as: {
      official: 'https://www.fate-sn.com/',
      wikipedia: 'https://ja.wikipedia.org/wiki/Fate/stay_night',
    },
    streamingServices: [
      { name: 'Netflix', url: 'https://www.netflix.com' },
      { name: 'Amazon Prime', url: 'https://www.amazon.com/prime' },
    ],
  },
};

// おすすめキャラクター用のモックデータ
const RECOMMENDED_CHARACTERS = [
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
];

export default createRoute((c) => {
  const id = c.req.param('id');
  // 実際のアプリケーションではIDを使用してデータを取得します
  const character = MOCK_CHARACTERS[id] || MOCK_CHARACTERS['1'];

  return c.render(
    <div className='max-w-6xl mx-auto'>
      {/* 戻るボタン */}
      <a
        href='/'
        className='inline-flex items-center gap-2 text-[#FFFDE7] hover:text-[#F3DB5F] mb-8 transition-colors'
      >
        <span className='text-[#FFFDE7]'>←</span>
        <span>キャラクター一覧に戻る</span>
      </a>

      <div className='bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30'>
        <div className='md:flex'>
          {/* 画像セクション */}
          <div className='md:w-1/2 relative'>
            <img
              src={character.image}
              alt={character.name}
              className='w-full aspect-[4/5] object-cover md:h-[500px]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent' />
          </div>

          {/* 情報セクション */}
          <div className='md:w-1/2 p-6 md:p-8 relative'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-[#F3DB5F] mb-2'>
                  {character.name}
                </h1>
                <p className='text-lg md:text-xl text-[#FFFDE780] mb-6'>
                  {character.animeName}
                </p>
              </div>
              <div className='self-start flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-yellow-900/30'>
                <span className='text-[#F3DB5F]'>♥</span>
                <span className='text-[#FFFDE7]'>{character.likes}</span>
              </div>
            </div>

            <p className='text-[#FFFDE7] mb-8 leading-relaxed'>
              {character.description}
            </p>

            {/* リンクセクション */}
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-[#F3DB5F] mb-4'>
                関連リンク
              </h2>
              <div className='grid gap-4'>
                <a
                  href={character.as.official}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 text-[#FFFDE7] hover:text-[#F3DB5F] transition-colors'
                >
                  <span className='text-[#FFFDE7]'>🌐</span>
                  <span>公式サイト</span>
                </a>
                <a
                  href={character.as.wikipedia}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 text-[#FFFDE7] hover:text-[#F3DB5F] transition-colors'
                >
                  <span className='text-[#FFFDE7]'>📖</span>
                  <span>Wikipedia</span>
                </a>
              </div>
            </div>

            {/* 配信サービス */}
            <div className='mt-8'>
              <h2 className='text-xl font-bold text-[#F3DB5F] mb-4'>
                視聴できる配信サービス
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {character.streamingServices.map(
                  (service: StreamingService) => (
                    <a
                      key={service.name}
                      href={service.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-[#FFFDE7] hover:text-[#F3DB5F] transition-colors'
                    >
                      <span className='text-[#FFFDE7]'>▶️</span>
                      <span>{service.name}</span>
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* おすすめキャラクター */}
      <div className='mt-16'>
        <h2 className='text-2xl font-bold text-[#F3DB5F] mb-8 flex items-center gap-2'>
          <span className='text-[#F3DB5F]'>⭐</span>
          <span>おすすめキャラクター</span>
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
          {RECOMMENDED_CHARACTERS.map((character) => (
            <CharacterCard key={character.id} {...character} />
          ))}
        </div>
      </div>
    </div>,
  );
});
