import { createRoute } from 'honox/factory';
import { CharacterCard } from '../components/character/character-card';
import { paginateItems } from '../lib/pagination';

import { getAllCharacters } from '@/lib/db';
import { SortOption, SortSelector } from '@/islands/SortSelector';
import { StatusMessage } from '@/components/character/StatusMessage';
import { Pagination } from '@/components/Pagination';
import { generateMetadata } from '@/lib/metadata';
import SearchForm from '@/components/SearchForm';

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

  // 検索クエリを取得
  const searchQuery = c.req.query('q') || '';

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
    searchQuery: searchQuery || undefined,
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

  const metadata = generateMetadata({
    title: currentPage === 1 ? undefined : `ページ${currentPage}`,
    canonical: `https://kinpatsu-heroine.com${currentPage === 1 ? '' : `?page=${currentPage}`}`,
  });

  return c.render(
    <div className='min-h-screen bg-background'>
      <div className='space-y-8 py-8'>
        {/* ヘロセクション - 1ページ目のみ表示 */}
        {currentPage === 1 && (
          <div className='text-center py-16 mx-4'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>
              <span className='bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent'>
                金髪ヒロインの世界へ
              </span>
            </h1>
            <p className='text-xl text-foreground-muted max-w-2xl mx-auto mb-8'>
              あなたのお気に入りの金髪ヒロインを見つけて、新しいアニメとの出会いを楽しみましょう
            </p>
            <a
              href='/register/work'
              className='inline-block bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-full px-8 py-4 font-bold text-lg hover:from-primary-light hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              ヒロインを登録する
            </a>
          </div>
        )}

        {/* 検索フォーム */}
        <div className='px-4'>
          <div className='max-w-7xl mx-auto'>
            <SearchForm currentQuery={searchQuery} />
          </div>
        </div>

        {/* ソートセレクター - 位置を調整 */}
        <div className='px-4'>
          <div className='max-w-7xl mx-auto flex justify-end items-center'>
            <SortSelector currentSort={currentSort} options={sortOptions} />
          </div>
        </div>

        <StatusMessage status={status} message={message} />

        {/* 検索結果の表示 */}
        {searchQuery && (
          <div className='px-4'>
            <div className='max-w-7xl mx-auto'>
              <div className='bg-background-light border border-border rounded-lg p-4 mb-6'>
                <p className='text-foreground'>
                  <span className='font-semibold'>「{searchQuery}」</span>
                  の検索結果：
                  <span className='text-primary font-bold ml-2'>
                    {allCharacters.length}件
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* キャラクターグリッド */}
        <div className='px-4'>
          {characters.length > 0 ? (
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
          ) : (
            <div className='max-w-7xl mx-auto text-center py-16'>
              <div className='bg-background-light border border-border rounded-lg p-8'>
                <div className='text-4xl mb-4'>😔</div>
                <h3 className='text-xl font-semibold text-foreground mb-2'>
                  {searchQuery
                    ? '検索結果が見つかりません'
                    : 'キャラクターが登録されていません'}
                </h3>
                <p className='text-foreground-muted mb-6'>
                  {searchQuery
                    ? `「${searchQuery}」に該当するキャラクターが見つかりませんでした。`
                    : 'まだキャラクターが登録されていません。最初のキャラクターを登録してみませんか？'}
                </p>
                {searchQuery ? (
                  <a
                    href='/'
                    className='inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium hover:bg-primary/90 transition-colors'
                  >
                    全てのキャラクターを見る
                  </a>
                ) : (
                  <a
                    href='/register/work'
                    className='inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium hover:bg-primary/90 transition-colors'
                  >
                    キャラクターを登録する
                  </a>
                )}
              </div>
            </div>
          )}
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
    { metadata },
  );
});
