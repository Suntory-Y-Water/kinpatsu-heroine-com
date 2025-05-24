import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='min-h-screen bg-gray-800'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto bg-gray-700 p-8 rounded-xl shadow-2xl border border-yellow-400'>
          <div className='text-center mb-8'>
            <div className='text-6xl mb-4'>✨</div>
            <h1 className='text-4xl font-bold text-yellow-300 border-b border-yellow-400 pb-6'>
              このサイトについて
            </h1>
          </div>
          <div className='space-y-8 text-gray-300 leading-relaxed text-lg'>
            <div className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
                <span>👋</span>
                ようこそ！
              </h2>
              <p>金髪ヒロイン.comへようこそ！</p>
            </div>

            <div className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
                <span>🎯</span>
                サイトの目的
              </h2>
              <p>
                このサイトは、アニメや漫画、ゲームなどに登場する魅力的な「金髪ヒロイン」たちにスポットライトを当てたファンサイトです。
              </p>
            </div>

            <div className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
                <span>📚</span>
                提供コンテンツ
              </h2>
              <p>
                作品情報、キャラクター紹介、そしてファンの皆さんがお気に入りのヒロインを応援できるようなコンテンツを提供していきます。
              </p>
            </div>

            <div className='bg-yellow-400/10 border border-yellow-400/30 p-6 rounded-lg'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
                <span>💫</span>
                私たちの願い
              </h2>
              <p className='text-yellow-300'>
                新しい作品との出会いや、お気に入りのヒロインの再発見のきっかけになれば幸いです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      title: 'このサイトについて',
      description:
        '金髪ヒロイン.comは、アニメや漫画、ゲームなどに登場する魅力的な「金髪ヒロイン」たちにスポットライトを当てたファンサイトです。',
      openGraph: {
        title: 'このサイトについて',
        description:
          '金髪ヒロイン.comは、アニメや漫画、ゲームなどに登場する魅力的な「金髪ヒロイン」たちにスポットライトを当てたファンサイトです。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/about' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: 'このサイトについて',
        description:
          '金髪ヒロイン.comは、アニメや漫画、ゲームなどに登場する魅力的な「金髪ヒロイン」たちにスポットライトを当てたファンサイトです。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/about' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
