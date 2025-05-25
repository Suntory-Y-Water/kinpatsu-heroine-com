import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto bg-background-light p-8 rounded-xl shadow-2xl border border-primary'>
          <div className='text-center mb-8'>
            <div className='text-6xl mb-4'>📧</div>
            <h1 className='text-4xl font-bold text-primary border-b border-primary pb-6'>
              お問い合わせ
            </h1>
          </div>

          <div className='space-y-8'>
            <div className='bg-background-lighter p-6 rounded-lg border border-border'>
              <h2 className='text-2xl font-bold text-primary mb-4 flex items-center gap-2'>
                <span>💬</span>
                お気軽にご連絡ください
              </h2>
              <p className='text-foreground text-lg leading-relaxed'>
                サイトに関するご意見、ご感想、誤字脱字の報告、その他お問い合わせは以下のフォームよりお願いいたします。
              </p>
            </div>

            <div className='bg-background-lighter border border-border p-12 rounded-lg text-center'>
              <div className='text-6xl mb-6'>🚧</div>
              <h3 className='text-2xl font-bold text-primary mb-4'>
                フォーム準備中
              </h3>
              <p className='text-foreground text-lg'>
                現在、お問い合わせフォームを準備中です。
              </p>
              <p className='text-foreground mt-2'>しばらくお待ちください。</p>
            </div>

            <div className='bg-primary/10 border border-primary/30 p-6 rounded-lg'>
              <h2 className='text-2xl font-bold text-primary mb-4 flex items-center gap-2'>
                <span>📝</span>
                お問い合わせ内容例
              </h2>
              <ul className='text-primary space-y-2'>
                <li>• サイトの機能に関するご質問</li>
                <li>• キャラクター情報の修正依頼</li>
                <li>• 新機能のご要望</li>
                <li>• その他ご意見・ご感想</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      title: 'お問い合わせ',
      description:
        '金髪ヒロイン.comへのご意見・ご感想はこちらからお願いします。サイトに関する質問や誤字脱字の報告も受け付けています。',
      openGraph: {
        title: 'お問い合わせ',
        description:
          '金髪ヒロイン.comへのご意見・ご感想はこちらからお願いします。サイトに関する質問や誤字脱字の報告も受け付けています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/contact' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: 'お問い合わせ',
        description:
          '金髪ヒロイン.comへのご意見・ご感想はこちらからお願いします。サイトに関する質問や誤字脱字の報告も受け付けています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/contact' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
