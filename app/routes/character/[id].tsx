import { createRoute } from 'honox/factory';
import { MOCK_CHARACTERS } from '../../../_mock';
import LikeButton from './$like-button';

export default createRoute((c) => {
  const id = c.req.param('id');
  // 実際のアプリケーションではIDを使用してデータを取得します
  const character = MOCK_CHARACTERS[id];

  if (!character) {
    return c.notFound();
  }

  return c.render(
    <div className='max-w-6xl mx-auto'>
      {/* 戻るボタン */}
      <a
        href='/'
        className='inline-flex items-center gap-2 text-white hover:text-yellow-300 mb-8 transition-colors'
      >
        <span className='text-white'>←</span>
        <span>キャラクター一覧に戻る</span>
      </a>

      <div className='bg-gradient-to-b  rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30'>
        <div className='md:flex'>
          {/* 画像セクション */}
          <div className='md:w-1/2 relative'>
            <img
              src={character.image}
              alt={character.name}
              className='w-full aspect-[4/5] object-cover md:h-[500px]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent' />
          </div>

          {/* 情報セクション */}
          <div className='md:w-1/2 p-6 md:p-8 relative'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-yellow-300 mb-2'>
                  {character.name}
                </h1>
                <p className='text-lg md:text-xl text-yellow-50/50 mb-6'>
                  {character.animeName}
                </p>
              </div>
              <div className='self-start'>
                <LikeButton initialLikes={character.likes} characterId={id} />
              </div>
            </div>

            <p className='text-white mb-8 leading-relaxed'>
              {character.description}
            </p>

            {/* 関連リンク */}
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-yellow-300 mb-4'>
                関連リンク
              </h2>
              <div className='grid gap-4'>
                <a
                  href={character.as.official}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 text-white hover:text-yellow-300 transition-colors'
                >
                  <span className='text-white'>🌐</span>
                  <span>公式サイト</span>
                </a>
                <a
                  href={character.as.wikipedia}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 text-white hover:text-yellow-300 transition-colors'
                >
                  <span className='text-white'>📖</span>
                  <span>Wikipedia</span>
                </a>
              </div>
            </div>

            {/* 配信サービス */}
            <div className='mt-8'>
              <h2 className='text-xl font-bold text-yellow-300 mb-4'>
                視聴できる配信サービス
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {character.streamingServices.map((service) => (
                  <a
                    key={service.name}
                    href={service.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-white hover:text-yellow-300 transition-colors'
                  >
                    <span className='text-white'>▶️</span>
                    <span>{service.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
  );
});
