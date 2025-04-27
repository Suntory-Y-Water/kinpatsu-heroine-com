import { createRoute } from 'honox/factory';
import { CharacterCard } from '../components/character/character-card';
import { paginateItems } from '../lib/pagination';

import { getAllCharacters } from '@/lib/db';
import { SortOption, SortSelector } from '@/islands/SortSelector';

type SortOrder = 'newest' | 'likes_desc';
const DEFAULT_SORT_ORDER: SortOrder = 'newest';

// TODO: jsあるので動かない
const sortOptions: SortOption[] = [
  { key: 'newest', label: '新着順' },
  { key: 'likes_desc', label: 'いいね順' },
];

// 最大表示件数
const ITEMS_PER_PAGE = 4;

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

  const paginatedResult = paginateItems(allCharacters, pageNum, ITEMS_PER_PAGE);
  const characters = paginatedResult.items;
  const currentPage = paginatedResult.currentPage;
  const totalPages = paginatedResult.totalPages;

  return c.render(
    <div className='space-y-8 pt-16 md:pt-0'>
      <div className='flex justify-end'>
        <SortSelector currentSort={currentSort} options={sortOptions} />
      </div>

      {/* キャラクターグリッド */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto'>
        {characters.map((character) => (
          <CharacterCard key={character.characterId} {...character} />
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-2 mt-8 flex-wrap'>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams();
            if (currentSort !== DEFAULT_SORT_ORDER) {
              params.set('sort', currentSort);
            }
            if (page > 1) {
              params.set('page', String(page));
            }
            const pageHref = `/?${params.toString()}`;
            return (
              <a
                href={pageHref}
                key={page}
                className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${currentPage === page ? 'bg-yellow-300 text-black font-bold' : 'text-white hover:bg-yellow-900/20'}
              `}
              >
                {page}
              </a>
            );
          })}
        </div>
      )}
    </div>,
  );
});
