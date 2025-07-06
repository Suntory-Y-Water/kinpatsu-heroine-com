import { StatusMessage } from '@/components/character/StatusMessage';
import { getRegistrationQueueTable } from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';
import { generateMetadata } from '@/lib/metadata';

/**
 * 表示タブの型定義
 */
type TabType = 'pending' | 'registered' | 'deleted';

export default createRoute(async (c) => {
  // クエリパラメータからステータスとメッセージを取得
  const status = c.req.query('status') as
    | 'error'
    | 'success'
    | 'info'
    | 'warning'
    | undefined;
  const message = c.req.query('message');

  // クエリパラメータからtabを取得（デフォルトはpending）
  const tab = (c.req.query('tab') as TabType) || 'pending';

  const result = await getRegistrationQueueTable(c.env.DB);

  if (result.isErr()) {
    throw new Error('作品情報の取得に失敗しました');
  }

  const allItems = result.value;

  // ステータスに応じてフィルタリング
  const pendingItems = allItems.filter(
    (item) => !item.isRegistered && !item.isDeleted,
  );
  const registeredItems = allItems.filter(
    (item) => item.isRegistered && !item.isDeleted,
  );
  const deletedItems = allItems.filter((item) => item.isDeleted);

  // タブに応じて表示するアイテムを選択
  const tabItems = {
    pending: pendingItems,
    registered: registeredItems,
    deleted: deletedItems,
  };

  const items = tabItems[tab] || pendingItems;
  const tabMessages = {
    pending: '受付待ちの登録リクエストはありません',
    registered: '登録済みのキャラクターはありません',
    deleted: '削除済みのキャラクターはありません',
  };

  const metadata = generateMetadata({
    title: '管理画面',
    description:
      'ユーザーが登録した情報を確認してから登録をすることができます。金髪ヒロインではない場合、登録した情報を削除することも可能です。',
    keywords: ['管理', '管理者'],
    canonical: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/admin' }),
    noindex: true,
  });

  return c.render(
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold text-primary mb-8 text-center'>
          管理画面
        </h1>

        <StatusMessage status={status} message={message} />

        {/* タブナビゲーション */}
        <div className='flex border-b border-primary mb-8 bg-background-light rounded-t-lg'>
          <a
            href='/admin?tab=pending'
            className={
              'py-4 px-6 font-medium transition-colors duration-300 first:rounded-tl-lg ' +
              (tab === 'pending'
                ? 'text-primary bg-background-lighter'
                : 'text-foreground-muted hover:text-primary hover:bg-background-lighter')
            }
          >
            受付待ちリスト ({pendingItems.length})
          </a>
          <a
            href='/admin?tab=registered'
            className={
              'py-4 px-6 font-medium transition-colors duration-300 ' +
              (tab === 'registered'
                ? 'text-primary bg-background-lighter'
                : 'text-foreground-muted hover:text-primary hover:bg-background-lighter')
            }
          >
            登録済みリスト ({registeredItems.length})
          </a>
          <a
            href='/admin?tab=deleted'
            className={
              'py-4 px-6 font-medium transition-colors duration-300 last:rounded-tr-lg ' +
              (tab === 'deleted'
                ? 'text-primary bg-background-lighter'
                : 'text-foreground-muted hover:text-primary hover:bg-background-lighter')
            }
          >
            削除済みリスト ({deletedItems.length})
          </a>
        </div>

        {/* カードグリッド表示 */}
        {items.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {items.map((item) => (
              <div
                key={item.characterId + '-' + item.workId}
                className='bg-background-light border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
              >
                {/* キャラクター画像とキャラクター名部分 */}
                <div className='relative'>
                  {/* 画像 */}
                  <div className='aspect-square'>
                    <img
                      src={item.imageUrl}
                      alt={item.characterName}
                      className={
                        'w-full h-full object-cover ' +
                        (item.isDeleted ? 'opacity-50 grayscale' : '')
                      }
                    />
                  </div>

                  {/* キャラクター名バー */}
                  <div className='absolute bottom-0 left-0 right-0 bg-background/90'>
                    <div className='p-3'>
                      <p className='text-primary font-bold text-sm'>
                        {item.characterName}
                      </p>
                      <p className='text-foreground-muted text-xs'>
                        {item.workName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 登録・削除ボタン（受付待ちリストの場合のみ表示） */}
                {tab === 'pending' && (
                  <div className='flex'>
                    <form
                      action='/admin/register'
                      method='post'
                      className='flex-1'
                    >
                      <input
                        type='hidden'
                        name='characterId'
                        value={item.characterId}
                      />
                      <input type='hidden' name='workId' value={item.workId} />
                      <input
                        type='hidden'
                        name='characterName'
                        value={item.characterName}
                      />
                      <input
                        type='hidden'
                        name='workName'
                        value={item.workName}
                      />
                      <input
                        type='hidden'
                        name='imageUrl'
                        value={item.imageUrl}
                      />
                      <button
                        type='submit'
                        className='cursor-pointer w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-bl-lg transition-colors duration-300'
                      >
                        ✓ 登録
                      </button>
                    </form>
                    <form
                      action='/admin/delete'
                      method='post'
                      className='flex-1'
                      onsubmit="return confirm('本当に削除しますか？');"
                    >
                      <input
                        type='hidden'
                        name='characterId'
                        value={item.characterId}
                      />
                      <input type='hidden' name='workId' value={item.workId} />
                      <button
                        type='submit'
                        className='cursor-pointer w-full py-3 bg-background-lighter hover:bg-muted text-foreground font-bold rounded-br-lg transition-colors duration-300'
                      >
                        ✗ 削除
                      </button>
                    </form>
                  </div>
                )}
                {tab === 'deleted' && (
                  <div className='flex'>
                    <form
                      action='/admin/restore'
                      method='post'
                      className='flex-1'
                    >
                      <input
                        type='hidden'
                        name='characterId'
                        value={item.characterId}
                      />
                      <input type='hidden' name='workId' value={item.workId} />
                      <button
                        type='submit'
                        className='cursor-pointer w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-bl-lg transition-colors duration-300'
                      >
                        ↻ 復元
                      </button>
                    </form>
                    <form
                      action='/admin/permanent-delete'
                      method='post'
                      className='flex-1'
                      onsubmit="return confirm('本当に完全に削除しますか？この操作は取り消せません。');"
                    >
                      <input
                        type='hidden'
                        name='characterId'
                        value={item.characterId}
                      />
                      <input type='hidden' name='workId' value={item.workId} />
                      <button
                        type='submit'
                        className='cursor-pointer w-full py-3 bg-error hover:bg-error text-foreground font-bold rounded-br-lg transition-colors duration-300'
                      >
                        🗑 完全削除
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-background-light border border-primary rounded-lg p-12 text-center'>
            <div className='text-6xl mb-4'>📄</div>
            <p className='text-foreground-muted text-lg font-medium'>
              {tabMessages[tab] || '情報がありません'}
            </p>
          </div>
        )}
      </div>
    </div>,
    { metadata },
  );
});
