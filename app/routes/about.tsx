import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-yellow-200 mb-8'>
          このサイトについて
        </h1>
        <div className='prose prose-invert max-w-none space-y-4 text-lg leading-relaxed'>
          <p>金髪ヒロイン.comへようこそ！</p>
          <p>
            このサイトは、アニメや漫画、ゲームなどに登場する魅力的な「金髪ヒロイン」たちにスポットライトを当てたファンサイトです。
          </p>
          <p>
            作品情報、キャラクター紹介、そしてファンの皆さんがお気に入りのヒロインを応援できるようなコンテンツを提供していきます。
          </p>
          <p>
            新しい作品との出会いや、お気に入りのヒロインの再発見のきっかけになれば幸いです。
          </p>
        </div>
      </div>
    </div>,
  );
});
