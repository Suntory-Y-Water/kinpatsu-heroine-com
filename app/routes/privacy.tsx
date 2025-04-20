import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-yellow-300 mb-8'>
          プライバシーポリシー
        </h1>
        <div className='prose prose-invert max-w-none space-y-6 text-lg leading-relaxed'>
          <section>
            <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
              個人情報の取得
            </h2>
            <p>
              当サイトでは、お問い合わせやコメント投稿の際に、名前（ハンドルネーム）、メールアドレス等の個人情報をご登録いただく場合がございます。
            </p>
          </section>
          <section>
            <h2 className='text-2xl font-semibold text-yellow-300 mb-4'>
              個人情報の利用目的
            </h2>
            <p>
              取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
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
        </div>
      </div>
    </div>,
  );
});
