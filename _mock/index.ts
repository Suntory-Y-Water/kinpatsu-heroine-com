// 仮のデータマップ
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

interface StreamingService {
  name: string;
  url: string;
}

export const MOCK_CHARACTERS: Record<string, Character> = {
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

// 仮のデータ
export const MOCK_CHARACTERS_LIST = [
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
