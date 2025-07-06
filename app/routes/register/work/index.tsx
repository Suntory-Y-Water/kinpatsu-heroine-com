import { createRoute } from 'honox/factory';
import { absoluteUrl } from '@/lib/utils';
import { generateMetadata } from '@/lib/metadata';
import WorkForm from './$work-form';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getWorkCharactersById, getWorks } from '@/lib/api';
import { StatusMessage } from '@/components/character/StatusMessage';
import { cache } from 'hono/cache';
import { getCharacterById } from '@/lib/db';

const workFormSchema = z.object({
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
});

export const POST = createRoute(
  zValidator('form', workFormSchema, (result, c) => {
    if (!result.success) {
      const { logger } = c.var;
      logger.error({
        method: 'createRegistrationWork',
        message: '入力内容に誤りがあります。',
        error: result.error,
      });
      const message = encodeURIComponent(
        '入力内容に誤りがあります。\nプルダウンから作品を選択してください。',
      );
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }
  }),
  async (c) => {
    const { workId, workName } = await c.req.valid('form');
    const { logger } = c.var;
    const DB = c.env.DB;

    const result = await getWorkCharactersById({
      clientId: c.env.ANNICT_CLIENT_ID,
      id: workId,
    });

    if (result.isErr()) {
      logger.error({
        method: 'getWorkCharactersById',
        message: result.error.message,
        error: result.error,
      });
      throw new Error(result.error.message);
    }

    const characterEdges =
      result.value.data.searchWorks.edges[0]?.node.casts.edges || [];
    const characterData = characterEdges.map((edge) => ({
      annictId: edge.node.character.annictId,
      name: edge.node.character.name,
    }));

    if (characterData.length === 0) {
      const message = encodeURIComponent(
        'この作品にはキャラクターが登録されていません。',
      );
      logger.error({
        message,
        workId,
        workName,
      });
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }

    // 作品からキャラクター情報の取得
    const registeredCharactersResult = await getCharacterById({ DB, workId });

    if (registeredCharactersResult.isErr()) {
      logger.error({
        method: 'getCharacterById',
        message: '登録済みキャラクターIDの取得中に予期せぬエラーが発生しました',
        error: registeredCharactersResult.error,
      });
      throw new Error('登録済みキャラクター情報の取得に失敗しました。');
    }

    const registeredCharacterIds = registeredCharactersResult.value.map(
      (char: { characterId: number }) => char.characterId,
    );

    // 取得した作品情報から既に登録済みのキャラクターを除外する
    const unregisteredCharacters = characterData.filter(
      (char) => !registeredCharacterIds.includes(char.annictId),
    );

    if (unregisteredCharacters.length === 0) {
      const message = encodeURIComponent(
        'この作品には登録可能なキャラクターがありません。',
      );
      logger.error({
        message,
        workId,
        workName,
      });
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }

    // 次画面で使用するためクエリパラメータに作品ID、作品名、キャラクター情報をJSON文字列としてセット
    const params = new URLSearchParams();
    params.set('workId', workId.toString());
    params.set('workName', workName);
    // キャラクター情報をJSON文字列に変換してセット
    params.set('characters', JSON.stringify(unregisteredCharacters));

    return c.redirect(`/register/character?${params.toString()}`, 303);
  },
);

export default createRoute(
  cache({
    cacheName: 'register-work-cache',
    cacheControl: 'public, max-age=3600',
    wait: false,
  }),
  async (c) => {
    const { logger } = c.var;
    // クエリパラメータからステータスとメッセージを取得
    const status = c.req.query('status') as
      | 'error'
      | 'success'
      | 'info'
      | 'warning'
      | undefined;
    const message = c.req.query('message');

    // キャラクター登録画面から、現在登録していない作品を取得します。
    // annictから作品情報を取得
    const result = await getWorks({
      clientId: c.env.ANNICT_CLIENT_ID,
    });

    if (result.isErr()) {
      logger.error({
        method: 'getWorks',
        message: '作品情報の取得に失敗しました',
        error: result.error,
      });
      throw new Error(result.error.message);
    }

    const resultList = result.value.data.searchWorks.nodes.map((node) => ({
      annictId: node.annictId,
      title: node.title,
    }));

    const metadata = generateMetadata({
      title: '作品登録',
      description:
        '新しい金髪ヒロインを登録するために、まずは作品を選択してください。',
      keywords: ['登録', 'フォーム', '作品'],
      canonical: absoluteUrl({
        url: c.env.PUBLIC_APP_URL,
        path: '/register/work',
      }),
    });

    return c.render(
      <div className='min-h-screen bg-background py-8 px-4'>
        <div className='max-w-xl mx-auto bg-background-light py-8 px-4 rounded-xl shadow-2xl'>
          <h1 className='text-4xl font-bold text-center mb-8 text-primary'>
            作品登録
          </h1>
          <div className='mb-8 p-6 bg-background-lighter rounded-lg border border-border'>
            <h2 className='text-xl font-bold text-primary mb-4 flex items-center gap-2'>
              <span>✨</span>
              ヒロインの登録方法
            </h2>
            <div className='space-y-3 text-foreground'>
              <p className='flex items-start gap-2'>
                <span className='text-primary font-medium'>1.</span>
                まず作品を選択してください🎨
              </p>
              <p className='flex items-start gap-2'>
                <span className='text-primary font-medium'>2.</span>
                作品内の金髪ヒロインを選択します👧
              </p>
              <p className='flex items-start gap-2'>
                <span className='text-primary font-medium'>3.</span>
                管理者の確認後にサイトに掲載されます👀
              </p>
            </div>
            <div className='mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg'>
              <p className='text-primary font-medium text-center'>
                ✨ 新しい金髪ヒロインを発見して、サイトを充実させましょう！
              </p>
            </div>
          </div>
          <StatusMessage status={status} message={message} />
          <form method='post' action='/register/work' id='workForm'>
            <WorkForm works={resultList} />
            <button
              type='submit'
              id='submitButton'
              disabled
              className='w-full bg-primary hover:bg-primary-light text-primary-foreground py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:bg-background-lighter disabled:text-foreground-muted disabled:cursor-not-allowed disabled:hover:bg-background-lighter disabled:transform-none shadow-lg'
            >
              次へ
            </button>
          </form>
        </div>
      </div>,
      { metadata },
    );
  },
);
