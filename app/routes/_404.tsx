import type { NotFoundHandler } from 'hono';

const handler: NotFoundHandler = (c) => {
  c.status(404);
  return c.render(
    <div className='min-h-screen bg-gray-800 flex items-center justify-center py-8 px-4'>
      <div className='max-w-2xl mx-auto bg-gray-700 p-8 rounded-xl shadow-2xl border border-yellow-400 text-center'>
        <div className='text-8xl mb-6'>🔍</div>
        <h1 className='text-4xl font-bold text-yellow-300 mb-6'>
          404 Page Not Found
        </h1>
        <p className='text-gray-300 text-lg mb-8 leading-relaxed'>
          お探しのページが見つかりませんでした。
          <br />
          URLが間違っているか、ページが移動・削除されている可能性があります。
        </p>

        <div className='space-y-4'>
          <a
            href='/'
            className='inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
          >
            🏠 ホームに戻る
          </a>

          <div className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
            <h2 className='text-xl font-bold text-yellow-300 mb-4 flex items-center justify-center gap-2'>
              <span>💡</span>
              おすすめのページ
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-left'>
              <a
                href='/'
                className='bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-yellow-300 group-hover:text-yellow-400'>
                  🏠
                </span>
                <span className='text-white group-hover:text-yellow-300'>
                  トップページ
                </span>
              </a>
              <a
                href='/register/work'
                className='bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-yellow-300 group-hover:text-yellow-400'>
                  ✨
                </span>
                <span className='text-white group-hover:text-yellow-300'>
                  キャラクター登録
                </span>
              </a>
              <a
                href='/about'
                className='bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-yellow-300 group-hover:text-yellow-400'>
                  ℹ️
                </span>
                <span className='text-white group-hover:text-yellow-300'>
                  サイトについて
                </span>
              </a>
              <a
                href='/contact'
                className='bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-yellow-300 group-hover:text-yellow-400'>
                  📧
                </span>
                <span className='text-white group-hover:text-yellow-300'>
                  お問い合わせ
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
  );
};

export default handler;
