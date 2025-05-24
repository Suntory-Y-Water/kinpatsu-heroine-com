import { createRoute } from 'honox/factory';
import { absoluteUrl } from '@/lib/utils';
import LikeButton from './$like-button';
import { getRegistrationCharacterById } from '@/lib/db';
import { getCookie } from 'hono/cookie';
import { getLikeCharacterById } from '@/lib/db/getLikeCharacterById';

function getStreamingIcon(streamingSiteId: string): {
  src: string;
  alt: string;
} {
  const iconMap: Record<string, { src: string; alt: string }> = {
    'www.netflix.com': { src: '/streaming-icons/netflix.png', alt: 'Netflix' },
    'www.b-ch.com': {
      src: '/streaming-icons/bandai.png',
      alt: 'バンダイチャンネル',
    },
    'ch.nicovideo.jp': {
      src: '/streaming-icons/niconico-anime-store.jpg',
      alt: 'ニコニコチャンネル',
    },
    'animestore.docomo.ne.jp': {
      src: '/streaming-icons/animestore.webp',
      alt: 'dアニメストア',
    },
    'www.amazon.co.jp': {
      src: '/streaming-icons/amazon-prime.png',
      alt: 'Amazon プライム・ビデオ',
    },
    'abema.tv': { src: '/streaming-icons/abema.png', alt: 'ABEMAビデオ' },
    'www.nicovideo.jp': {
      src: '/streaming-icons/niconico-anime-store.jpg',
      alt: 'dアニメストア ニコニコ支店',
    },
  };

  return (
    iconMap[streamingSiteId] || {
      src: '/streaming-icons/default.png',
      alt: 'デフォルトアイコン',
    }
  );
}

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
    <div className='min-h-screen bg-gray-800 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* 戻るボタン */}
        <a
          href='/'
          className='inline-flex items-center gap-3 text-white hover:text-yellow-300 mb-8 transition-all duration-300 transform hover:scale-105 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full border border-gray-600 hover:border-yellow-400'
        >
          <span className='text-yellow-300'>←</span>
          <span className='font-medium'>キャラクター一覧に戻る</span>
        </a>

        <div className=' rounded-xl shadow-2xl border border-yellow-400 overflow-hidden lg:overflow-visible lg:p-6'>
          <div className='lg:flex lg:gap-6'>
            {/* 画像セクション */}
            <div className='lg:w-1/2 relative'>
              <img
                src={character.imageUrl}
                alt={character.characterName}
                className='w-full aspect-[4/5] object-cover lg:rounded-lg'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-gray-900/60 lg:to-transparent lg:rounded-lg' />
            </div>

            {/* 情報セクション */}
            <div className='lg:w-1/2 p-6 lg:p-0 bg-gray-800 lg:bg-transparent'>
              <div className='flex flex-col gap-6'>
                <div>
                  <h1 className='text-3xl lg:text-4xl font-bold text-yellow-300 mb-3'>
                    {character.characterName}
                  </h1>
                  <p className='text-xl lg:text-2xl text-gray-300 mb-6'>
                    {character.workName}
                  </p>
                </div>

                {/* いいねボタン */}
                <div className='mb-6'>
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
                <div className='mb-6'>
                  <h2 className='text-lg lg:text-xl font-bold text-yellow-300 mb-4 border-l-4 border-yellow-400 pl-3'>
                    <span className='text-yellow-400'>🔗</span>
                    関連リンク
                  </h2>
                  <div className='space-y-3'>
                    {character.infoUrl.officialSiteUrl && (
                      <a
                        href={character.infoUrl.officialSiteUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 group'
                      >
                        <span className='text-yellow-300 group-hover:text-yellow-400 text-lg'>
                          🌐
                        </span>
                        <span className='text-white group-hover:text-yellow-300 font-medium'>
                          公式サイト
                        </span>
                        <span className='ml-auto text-gray-400 group-hover:text-yellow-300 transition-colors duration-300'>
                          →
                        </span>
                      </a>
                    )}
                    {character.infoUrl.wikipediaUrl && (
                      <a
                        href={character.infoUrl.wikipediaUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 group'
                      >
                        <span className='text-yellow-300 group-hover:text-yellow-400 text-lg'>
                          📖
                        </span>
                        <span className='text-white group-hover:text-yellow-300 font-medium'>
                          Wikipedia
                        </span>
                        <span className='ml-auto text-gray-400 group-hover:text-yellow-300 transition-colors duration-300'>
                          →
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 配信サービス */}
              {character.streamingSiteInfo.length > 0 && (
                <div>
                  <h2 className='text-lg lg:text-xl font-bold text-yellow-300 mb-4 border-l-4 border-yellow-400 pl-3'>
                    <span className='text-yellow-400'>🔗</span>
                    視聴できる配信サービス
                  </h2>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    {character.streamingSiteInfo.map((service) => {
                      const iconInfo = getStreamingIcon(
                        service.streamingSiteId,
                      );
                      return (
                        <a
                          key={service.streamingSiteId}
                          href={service.streamingSiteUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-400 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 group'
                        >
                          <div className='w-6 h-6 flex-shrink-0 rounded-sm overflow-hidden bg-white p-0.5'>
                            <img
                              src={iconInfo.src}
                              alt={iconInfo.alt}
                              className='w-full h-full object-contain'
                              onError={(e: Event) => {
                                // アイコンが読み込めない場合は▶️絵文字を表示
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<span class="text-yellow-300 text-lg">▶️</span>';
                                }
                              }}
                            />
                          </div>
                          <span className='text-white group-hover:text-yellow-300 font-medium text-sm lg:text-base'>
                            {service.streamingSiteName}
                          </span>
                          <span className='ml-auto text-gray-400 group-hover:text-yellow-300 transition-colors duration-300'>
                            →
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      title: `${character.characterName}`,
      description: `「${character.characterName}」のプロフィールページです。『${character.workName}』に登場します。`,
      openGraph: {
        title: `${character.characterName}`,
        description: `「${character.characterName}」のプロフィールページです。『${character.workName}』に登場します。`,
        url: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: `/character/${id}`,
        }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: `${character.characterName}`,
        description: `「${character.characterName}」のプロフィールページです。『${character.workName}』に登場します。`,
        url: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: `/character/${id}`,
        }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
