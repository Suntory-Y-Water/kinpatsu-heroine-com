import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='min-h-screen bg-[#1A1F2C] text-[#FFFDE7]'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-[#F3DB5F] mb-8'>利用規約</h1>
        <div className='prose prose-invert max-w-none space-y-6 text-lg leading-relaxed'>
          <section>
            <h2 className='text-2xl font-semibold text-[#F3DB5F] mb-4'>
              第1条（適用）
            </h2>
            <p>
              本利用規約（以下、「本規約」といいます。）は、[サイト名]（以下、「当サイト」といいます。）が提供するサービスの利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
            </p>
          </section>
          <section>
            <h2 className='text-2xl font-semibold text-[#F3DB5F] mb-4'>
              第2条（禁止事項）
            </h2>
            <p>
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className='list-disc list-inside space-y-2 pl-4'>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>
                当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
              </li>
              <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>
                当サイトのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
              </li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ul>
          </section>
          <section>
            <h2 className='text-2xl font-semibold text-[#F3DB5F] mb-4'>
              第3条（免責事項）
            </h2>
            <p>
              当サイトは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを保証するものではありません。
            </p>
            <p>
              当サイトは、本サービスによってユーザーに生じたあらゆる損害について、一切の責任を負いません。
            </p>
          </section>
          <p className='mt-8'>
            （利用規約の内容は適宜変更される可能性があります。最新の情報をご確認ください。）
          </p>
        </div>
      </div>
    </div>,
  );
});
