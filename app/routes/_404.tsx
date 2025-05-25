import type { NotFoundHandler } from 'hono';

const handler: NotFoundHandler = (c) => {
  c.status(404);
  return c.render(
    <div className='min-h-screen bg-background flex items-center justify-center py-8 px-4'>
      <div className='max-w-2xl mx-auto bg-background-light p-8 rounded-xl shadow-2xl border border-primary text-center'>
        <div className='text-8xl mb-6'>🔍</div>
        <h1 className='text-4xl font-bold text-primary mb-6'>
          404 Page Not Found
        </h1>
        <p className='text-foreground-muted text-lg mb-8 leading-relaxed'>
          お探しのページが見つかりませんでした。
          <br />
          URLが間違っているか、ページが移動・削除されている可能性があります。
        </p>

        <div className='space-y-4'>
          <a
            href='/'
            className='inline-block bg-primary hover:bg-primary-light text-primary-foreground py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
          >
            🏠 ホームに戻る
          </a>

          <div className='bg-background-lighter p-6 rounded-lg border border-border'>
            <h2 className='text-xl font-bold text-primary mb-4 flex items-center justify-center gap-2'>
              <span>💡</span>
              おすすめのページ
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-left'>
              <a
                href='/'
                className='bg-background hover:bg-background-lighter border border-border hover:border-primary px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-primary group-hover:text-primary-light'>
                  🏠
                </span>
                <span className='text-foreground group-hover:text-primary'>
                  トップページ
                </span>
              </a>
              <a
                href='/register/work'
                className='bg-background hover:bg-background-lighter border border-border hover:border-primary px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-primary group-hover:text-primary-light'>
                  ✨
                </span>
                <span className='text-foreground group-hover:text-primary'>
                  キャラクター登録
                </span>
              </a>
              <a
                href='/about'
                className='bg-background hover:bg-background-lighter border border-border hover:border-primary px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-primary group-hover:text-primary-light'>
                  ℹ️
                </span>
                <span className='text-foreground group-hover:text-primary'>
                  サイトについて
                </span>
              </a>
              <a
                href='/contact'
                className='bg-background hover:bg-background-lighter border border-border hover:border-primary px-4 py-3 rounded-lg transition-all duration-300 group flex items-center gap-2'
              >
                <span className='text-primary group-hover:text-primary-light'>
                  📧
                </span>
                <span className='text-foreground group-hover:text-primary'>
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
