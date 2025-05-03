import { StatusMessage } from '@/components/character/StatusMessage';
import { getRegistrationQueueTable } from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';

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

  return c.render(
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-4'>
        <h1 className='text-3xl font-bold text-yellow-300 mb-8'>管理画面</h1>

        <StatusMessage status={status} message={message} />

        {/* タブナビゲーション */}
        <div className='flex border-b border-yellow-900/30 mb-6'>
          <a
            href='/admin?tab=pending'
            className={
              'py-2 px-4 ' +
              (tab === 'pending'
                ? 'text-yellow-300 border-b-2 border-yellow-300'
                : 'text-gray-400 hover:text-yellow-200')
            }
          >
            受付待ちリスト ({pendingItems.length})
          </a>
          <a
            href='/admin?tab=registered'
            className={
              'py-2 px-4 ' +
              (tab === 'registered'
                ? 'text-yellow-300 border-b-2 border-yellow-300'
                : 'text-gray-400 hover:text-yellow-200')
            }
          >
            登録済みリスト ({registeredItems.length})
          </a>
          <a
            href='/admin?tab=deleted'
            className={
              'py-2 px-4 ' +
              (tab === 'deleted'
                ? 'text-yellow-300 border-b-2 border-yellow-300'
                : 'text-gray-400 hover:text-yellow-200')
            }
          >
            削除済みリスト ({deletedItems.length})
          </a>
        </div>

        {/* カードグリッド表示 */}
        {items.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {items.map((item) => (
              <div
                key={item.characterId + '-' + item.workId}
                className='overflow-hidden rounded-lg'
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
                        (item.isDeleted ? 'opacity-50' : '')
                      }
                    />
                  </div>

                  {/* キャラクター名バー */}
                  <div className='absolute bottom-0 left-0 right-0 bg-black/70'>
                    <div className='p-3'>
                      <p className='text-yellow-300 font-bold'>
                        {item.characterName}
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
                        className='w-full py-2 bg-black/80 text-yellow-300 font-medium rounded-bl-lg hover:bg-gray-700 hover:text-yellow-200 cursor-pointer transition-colors'
                      >
                        登録
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
                        className='w-full py-2 bg-black/80 text-white font-medium rounded-br-lg hover:bg-gray-700 hover:text-gray-200 cursor-pointer transition-colors'
                      >
                        削除
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-gray-800 rounded-lg border border-yellow-900/30 p-8 text-center text-gray-400'>
            {tabMessages[tab] || '情報がありません'}
          </div>
        )}
      </div>
    </div>,
    {
      title: '管理画面',
      description:
        'ユーザーが登録した情報を確認してから登録をすることができます。金髪ヒロインではない場合、登録した情報を削除することも可能です。',
      openGraph: {
        title: '管理画面',
        description: '管理画面',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/admin' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: '管理画面',
        description:
          'ユーザーが登録した情報を確認してから登録をすることができます。金髪ヒロインではない場合、登録した情報を削除することも可能です。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/admin' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
