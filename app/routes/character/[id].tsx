import { createRoute } from 'honox/factory';

import LikeButton from './$like-button';
import { getRegistrationCharacterById } from '@/lib/db';
import { getCookie } from 'hono/cookie';
import { getLikeCharacterById } from '@/lib/db/getLikeCharacterById';

export default createRoute(async (c) => {
  const id = c.req.param('id');

  const { logger } = c.var;

  const result = await getRegistrationCharacterById({
    DB: c.env.DB,
    characterId: Number(id),
  });

  if (result.isErr()) {
    logger.error({
      method: 'getRegistrationCharacterById',
      message: 'DBからキャラクター情報を取得できませんでした',
    });
    return c.notFound();
  }

  const character = result.value;

  if (!character) {
    return c.notFound();
  }

  // いいね数を取得するためにCookieIDを取得
  const cookieId = getCookie(c, 'visitor_id');

  const isLikedResult = await getLikeCharacterById({
    DB: c.env.DB,
    characterId: Number(id),
    cookieId: cookieId ?? '', // Cookieが設定されていない場合は空文字を設定
  });

  const isLiked = isLikedResult.isOk() ? isLikedResult.value : false;

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

      <div className='bg-gradient-to-b rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30'>
        <div className='md:flex'>
          {/* 画像セクション */}
          <div className='md:w-1/2 relative'>
            <img
              src={character.imageUrl}
              alt={character.characterName}
              className='w-full aspect-[4/5] object-cover md:h-[500px]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-black/30 md:to-transparent' />
          </div>

          {/* 情報セクション */}
          <div className='md:w-1/2 p-6 md:p-8 relative'>
            <div className='flex flex-col gap-4'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-yellow-300 mb-2'>
                  {character.characterName}
                </h1>
                <p className='text-lg md:text-xl text-yellow-50/50 mb-4'>
                  {character.workName}
                </p>
              </div>

              {/* いいねボタン - モバイルで左寄せ */}
              <div className=''>
                <LikeButton
                  initialLikes={character.likes}
                  characterId={character.characterId}
                  isLiked={isLiked}
                />
              </div>
            </div>

            {/* 関連リンク */}
            {(character.infoUrl.officialSiteUrl ||
              character.infoUrl.wikipediaUrl) && (
              <div className='space-y-4 mt-8'>
                <h2 className='text-xl font-bold text-yellow-300 mb-4'>
                  関連リンク
                </h2>
                <div className='grid gap-4'>
                  {character.infoUrl.officialSiteUrl && (
                    <a
                      href={character.infoUrl.officialSiteUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 text-white hover:text-yellow-300 transition-colors'
                    >
                      <span className='text-white'>🌐</span>
                      <span>公式サイト</span>
                    </a>
                  )}
                  {character.infoUrl.wikipediaUrl && (
                    <a
                      href={character.infoUrl.wikipediaUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 text-white hover:text-yellow-300 transition-colors'
                    >
                      <span className='text-white'>📖</span>
                      <span>Wikipedia</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 配信サービス */}
            {character.streamingSiteInfo.length > 0 && (
              <div className='mt-8'>
                <h2 className='text-xl font-bold text-yellow-300 mb-4'>
                  視聴できる配信サービス
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {character.streamingSiteInfo.map((service) => (
                    <a
                      key={service.streamingSiteId}
                      href={service.streamingSiteUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-white hover:text-yellow-300 transition-colors'
                    >
                      <span className='text-white'>▶️</span>
                      <span>{service.streamingSiteName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
  );
});
