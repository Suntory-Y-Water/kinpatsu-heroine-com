export function Footer() {
  return (
    <footer className='bg-[#1A1F2C] mt-16 border-t border-yellow-900/30'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* ロゴとサイト説明 */}
          <div className='md:col-span-2'>
            <a href='/' className='flex items-center gap-2 mb-4'>
              <span className='text-[#F3DB5F] text-xl font-bold'>
                金髪ヒロイン.com
              </span>
            </a>
            <p className='text-[#FFFDE780] text-sm leading-relaxed'>
              アニメの金髪ヒロインに特化した情報サイトです。
              あなたのお気に入りのキャラクターを見つけ、
              新しい作品との出会いを楽しみましょう。
            </p>
          </div>

          {/* リンク集1 */}
          <div>
            <h3 className='text-[#F3DB5F] font-bold mb-4'>サイト情報</h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/about'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  このサイトについて
                </a>
              </li>
              <li>
                <a
                  href='/terms'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  利用規約
                </a>
              </li>
              <li>
                <a
                  href='/privacy'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a
                  href='/contact'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          {/* リンク集2 */}
          <div>
            <h3 className='text-[#F3DB5F] font-bold mb-4'>コミュニティ</h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='https://twitter.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href='https://github.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[#FFFDE7] hover:text-[#F3DB5F] text-sm transition-colors'
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className='mt-12 pt-8 border-t border-yellow-900/30 text-center'>
          <p className='text-[#FFFDE780] text-sm'>
            © 2024 金髪ヒロイン.com All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
