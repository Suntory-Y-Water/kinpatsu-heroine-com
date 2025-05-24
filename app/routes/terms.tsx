import { absoluteUrl } from '@/lib/utils';
import { createRoute } from 'honox/factory';
import { PolicyLayout } from '../components/PolicyLayout';

export default createRoute((c) => {
  return c.render(
    <PolicyLayout title='利用規約'>
      <section className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
        <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
          <span>📜</span>
          第1条（適用）
        </h2>
        <p>
          本利用規約（以下、「本規約」といいます。）は、金髪ヒロイン.com（以下、「当サイト」といいます。）が提供するサービスの利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
        </p>
      </section>

      <section className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
        <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
          <span>⚠️</span>
          第2条（禁止事項）
        </h2>
        <p className='mb-4'>
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
        </p>
        <ul className='list-disc list-inside space-y-2 pl-4'>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>著作権、肖像権その他、第三者の権利を侵害する行為</li>
          <li>
            特定のキャラクターや作品、作者、他のユーザーに対する誹謗中傷、名誉毀損、または過度な批判
          </li>
          <li>
            当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
          </li>
          <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
          <li>他のユーザーの同意なく個人情報を収集または公開する行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>わいせつな情報または青少年に有害な情報を送信する行為</li>
          <li>
            当サイトのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
          </li>
          <li>その他、当サイトが不適切と判断する行為</li>
        </ul>
      </section>

      <section className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
        <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
          <span>🛡️</span>
          第3条（免責事項）
        </h2>
        <div className='space-y-4'>
          <p>
            当サイトは、掲載する情報について可能な限り正確性を期しておりますが、その完全性、正確性、最新性を保証するものではありません。
          </p>
          <p>
            当サイトは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを保証するものではありません。
          </p>
          <p>
            当サイトは、本サービスによってユーザーに生じたあらゆる損害について、一切の責任を負いません。
          </p>
        </div>
      </section>

      <section className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
        <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
          <span>📤</span>
          第4条（投稿コンテンツについて）
        </h2>
        <div className='space-y-4'>
          <p>
            ユーザーは、投稿する画像やコンテンツについて、著作権を含むすべての必要な権利を有していること、および投稿するコンテンツが第三者の権利を侵害していないことを表明し、保証するものとします。
          </p>
          <p>
            無許可の著作物のアップロードは一切禁止します。当サイトは著作権侵害に対して厳正に対処します。
          </p>
        </div>
      </section>

      <section className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
        <h2 className='text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2'>
          <span>⚖️</span>
          第5条（ライセンスの付与）
        </h2>
        <p>
          ユーザーは、投稿した画像について、当サイトに対し表示目的での非独占的、無償のライセンスを付与するものとします。このライセンスは著作権者からの削除要請により直ちに失効します。
        </p>
      </section>

      <div className='bg-yellow-400/10 border border-yellow-400/30 p-6 rounded-lg'>
        <p className='text-yellow-300 text-center font-medium'>
          📅 2025年5月5日 制定
        </p>
      </div>
    </PolicyLayout>,
    {
      title: '利用規約',
      description:
        '金髪ヒロイン.comの利用規約です。当サイトのサービス利用条件や禁止事項、免責事項について定めています。',
      openGraph: {
        title: '利用規約',
        description:
          '金髪ヒロイン.comの利用規約です。当サイトのサービス利用条件や禁止事項、免責事項について定めています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/terms' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: '利用規約',
        description:
          '金髪ヒロイン.comの利用規約です。当サイトのサービス利用条件や禁止事項、免責事項について定めています。',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/terms' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
