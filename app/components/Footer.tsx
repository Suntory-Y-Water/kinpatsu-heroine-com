export function Footer() {
  return (
    <footer className='bg-background border-t border-primary shadow-xl'>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
          {/* ロゴとサイト説明 */}
          <div className='md:col-span-2'>
            <a
              href='/'
              className='inline-block mb-6 group transition-all duration-300 hover:scale-105'
            >
              <span className='text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent group-hover:from-primary-light group-hover:to-primary transition-all duration-300'>
                金髪ヒロイン.com
              </span>
            </a>
            <p className='text-foreground text-base leading-relaxed max-w-md'>
              アニメの金髪ヒロインに特化した情報サイトです。
              あなたのお気に入りのキャラクターを見つけ、
              新しい作品との出会いを楽しみましょう。
            </p>
          </div>

          {/* リンク集 */}
          <div>
            <h3 className='text-primary font-bold mb-6 text-lg'>サイト情報</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='/about'
                  className='text-foreground hover:text-primary text-base transition-colors duration-300'
                >
                  このサイトについて
                </a>
              </li>
              <li>
                <a
                  href='/terms'
                  className='text-foreground hover:text-primary text-base transition-colors duration-300'
                >
                  利用規約
                </a>
              </li>
              <li>
                <a
                  href='/privacy'
                  className='text-foreground hover:text-primary text-base transition-colors duration-300'
                >
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a
                  href='/contact'
                  className='text-foreground hover:text-primary text-base transition-colors duration-300'
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className='mt-16 pt-8 border-t border-border'>
          <div className='text-center'>
            <p className='text-foreground text-base'>
              © 2025 金髪ヒロイン.com All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
