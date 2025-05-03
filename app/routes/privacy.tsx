import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';
import { PolicyLayout } from '../components/PolicyLayout';

export default createRoute((c) => {
  return c.render(
    <PolicyLayout title='プライバシーポリシー'>
      <section>
        <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
          個人情報の取得
        </h2>
        <p>
          当サイト「金髪ヒロイン.com」では、お問い合わせの際に、名前（ハンドルネーム）、メールアドレス等の個人情報をご登録いただく場合がございます。
        </p>
      </section>
      <section>
        <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
          個人情報の利用目的
        </h2>
        <p>
          取得した個人情報は、お問い合わせへの返信、およびサイト運営に必要な範囲でのご連絡のために利用させていただくものであり、これらの目的以外では利用いたしません。
        </p>
      </section>
      <section>
        <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
          個人情報の第三者への開示
        </h2>
        <p>
          当サイトでは、個人情報は適切に管理し、以下に該当する場合を除いて第三者に開示することはありません。
        </p>
        <ul className='list-disc list-inside space-y-2 pl-4'>
          <li>本人のご了解がある場合</li>
          <li>
            法令等への協力のため、開示が必要となる場合（警察からの要請など）
          </li>
        </ul>
      </section>
      <section>
        <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
          アクセス解析ツールについて
        </h2>
        <p>
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
        </p>
      </section>
      <p className='mt-8'>
        （プライバシーポリシーの内容は適宜変更される可能性があります。最新の情報をご確認ください。）
      </p>
    </PolicyLayout>,
    {
      title: 'プライバシーポリシー',
      description:
        '金髪ヒロイン.comのプライバシーポリシーです。当サイトでの個人情報の取り扱いやCookieの利用について説明しています。',
      openGraph: {
        title: 'プライバシーポリシー',
        description:
          '金髪ヒロイン.comのプライバシーポリシーです。当サイトでの個人情報の取り扱いやCookieの利用について説明しています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/privacy' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: 'プライバシーポリシー',
        description:
          '金髪ヒロイン.comのプライバシーポリシーです。当サイトでの個人情報の取り扱いやCookieの利用について説明しています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/privacy' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
