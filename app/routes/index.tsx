import { createRoute } from 'honox/factory';
import { CharacterCard } from '../components/character/character-card';
import { paginateItems } from '../lib/pagination';

import { getAllCharacters } from '@/lib/db';
import { SortOption, SortSelector } from '@/islands/SortSelector';
import { StatusMessage } from '@/components/character/StatusMessage';
import { Pagination } from '@/components/Pagination';

type SortOrder = 'newest' | 'likes_desc' | 'random';
const DEFAULT_SORT_ORDER: SortOrder = 'newest';

const sortOptions: SortOption[] = [
  { key: 'newest', label: '新着順' },
  { key: 'likes_desc', label: 'いいね順' },
  { key: 'random', label: 'ランダム' },
];

// 最大表示件数
const ITEMS_PER_PAGE = 8;

export default createRoute(async (c) => {
  const { logger } = c.var;
  const pageQuery = c.req.query('page');
  const pageNum = Number.parseInt(pageQuery || '1', 10) || 1;

  const sortQuery = c.req.query('sort') as SortOrder;
  const currentSort: SortOrder = sortOptions.some(
    (opt) => opt.key === sortQuery,
  )
    ? sortQuery
    : DEFAULT_SORT_ORDER;

  // クエリパラメータからステータスとメッセージを取得
  const status = c.req.query('status') as
    | 'error'
    | 'success'
    | 'info'
    | 'warning'
    | undefined;
  const message = c.req.query('message');

  const result = await getAllCharacters({
    DB: c.env.DB,
  });

  if (result.isErr()) {
    logger.error({
      method: 'getAllCharacters',
      message: 'キャラクター情報取得に失敗しました',
    });
    throw new Error('DBからキャラクター情報を取得できませんでした');
  }

  const allCharacters = result.value;

  if (currentSort === 'likes_desc') {
    allCharacters.sort((a, b) => b.likes - a.likes);
  }

  if (currentSort === 'random') {
    // Fisher-Yatesアルゴリズムを使用してランダムにシャッフル
    for (let i = allCharacters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCharacters[i], allCharacters[j]] = [
        allCharacters[j],
        allCharacters[i],
      ];
    }
  }

  const paginatedResult = paginateItems(allCharacters, pageNum, ITEMS_PER_PAGE);
  const characters = paginatedResult.items;
  const currentPage = paginatedResult.currentPage;
  const totalPages = paginatedResult.totalPages;

  return c.render(
    <div className='min-h-screen bg-gray-800'>
      <div className='space-y-8 py-8'>
        {/* ヘロセクション - 1ページ目のみ表示 */}
        {currentPage === 1 && (
          <div className='text-center py-16 mx-4'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>
              <span className='bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent'>
                金髪ヒロインの世界へ
              </span>
            </h1>
            <p className='text-xl text-gray-300 max-w-2xl mx-auto mb-8'>
              あなたのお気に入りの金髪ヒロインを見つけて、新しいアニメとの出会いを楽しみましょう
            </p>
            <a
              href='/register/work'
              className='inline-block bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 rounded-full px-8 py-4 font-bold text-lg hover:from-yellow-300 hover:to-yellow-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              ✨ ヒロインを登録する
            </a>
          </div>
        )}

        {/* ソートセレクター - 位置を調整 */}
        <div className='px-4'>
          <div className='max-w-7xl mx-auto flex justify-end items-center'>
            <SortSelector currentSort={currentSort} options={sortOptions} />
          </div>
        </div>

        <StatusMessage status={status} message={message} />

        {/* キャラクターグリッド */}
        <div className='px-4'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto'>
            {characters.map((character, index) => (
              <div
                key={character.characterId}
                className='transform transition-all duration-300'
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <CharacterCard {...character} />
              </div>
            ))}
          </div>
        </div>

        {/* ページネーション */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          sortOrder={currentSort}
          defaultSortOrder={DEFAULT_SORT_ORDER}
        />
      </div>
    </div>,
  );
});
