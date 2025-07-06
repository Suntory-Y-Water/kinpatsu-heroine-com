import { createRoute } from 'honox/factory';
import { absoluteUrl } from '@/lib/utils';
import CharacterForm from './$character-form';

import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createRegistrationCharacter } from '@/lib/db';
import ImageUploader from '../$image-uploader';
import { generateMetadata } from '@/lib/metadata';

const characterFormSchema = z.object({
  characterId: z.coerce
    .number()
    .min(1, { message: 'キャラクターIDは必須です' }),
  characterName: z.string().min(1, { message: 'キャラクター名は必須です' }),
  workId: z.coerce.number().min(1, { message: '作品IDは必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
  imageUrl: z.string().min(1, { message: '画像URLは必須です' }),
});

// Zodスキーマの定義
const characterSchema = z.object({
  annictId: z.number(),
  name: z.string().min(1),
});

const charactersSchema = z.array(characterSchema);

export const POST = createRoute(
  zValidator('form', characterFormSchema, (result, c) => {
    if (!result.success) {
      const { logger } = c.var;
      logger.error({
        method: 'createRegistrationCharacter',
        message: '入力内容に誤りがあります。',
        error: result.error,
      });
      const message = encodeURIComponent('入力内容に誤りがあります。');
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }
  }),
  async (c) => {
    const { characterId, characterName, workId, workName, imageUrl } =
      await c.req.valid('form');

    const { logger } = c.var;

    // リクエストボディの作成
    const requestBody = {
      workId,
      characterId,
      characterName,
      workName,
      imageUrl,
    };

    // キャラクター登録
    const result = await createRegistrationCharacter({
      DB: c.env.DB,
      character: requestBody,
    });

    if (result.isErr()) {
      logger.error({
        method: 'createRegistrationCharacter',
        message: 'キャラクター登録に失敗しました',
        error: result.error,
      });
      const message = encodeURIComponent(
        `登録に失敗しました: ${result.error.message}`,
      );
      return c.redirect(`/register/work?status=error&message=${message}`, 303);
    }

    // 成功した場合
    const message = encodeURIComponent(
      'キャラクターの登録に成功しました。管理者の確認後に表示されます。',
    );
    return c.redirect(`/?status=success&message=${message}`, 303);
  },
);

export default createRoute(async (c) => {
  const workId = c.req.query('workId');
  const workName = c.req.query('workName');
  const charactersQuery = c.req.query('characters');
  const { logger } = c.var;

  if (!workId || !workName || !charactersQuery) {
    logger.error({
      message: '必要なクエリパラメータが不足しています。',
      query: c.req.query(),
    });
    // エラーメッセージと共にリダイレクトするか、エラーページを表示する
    const message = encodeURIComponent(
      'キャラクター登録画面の表示に必要な情報が不足しています。',
    );
    return c.redirect(`/register/work?status=error&message=${message}`, 303);
  }

  if (!charactersQuery) {
    // charactersQuery が存在しない場合の処理
    logger.error({ message: 'クエリパラメータ "characters" がありません。' });
    const message = encodeURIComponent(
      'キャラクター情報が見つかりませんでした。最初から登録してください。',
    );
    return c.redirect(`/register/work?status=error&message=${message}`, 303);
  }

  let parsedData: unknown;
  try {
    // まずJSONとしてパース試行
    parsedData = JSON.parse(charactersQuery);
  } catch (error) {
    logger.error({
      message: 'キャラクター情報のJSONパースに失敗しました。',
      error,
    });
    const message = encodeURIComponent(
      'キャラクター情報の読み込みに失敗しました。',
    );
    return c.redirect(`/register/work?status=error&message=${message}`, 303);
  }

  // Zodで検証
  const validationResult = charactersSchema.safeParse(parsedData);

  if (!validationResult.success) {
    logger.error({
      message: 'キャラクター情報の検証に失敗しました。',
      error: validationResult.error.flatten(),
    });
    const message = encodeURIComponent('キャラクター情報の形式が不正です。');
    return c.redirect(`/?status=error&message=${message}`, 303);
  }

  // 検証成功、型安全なデータを使用
  const characterData = validationResult.data;

  const metadata = generateMetadata({
    title: 'キャラクター登録',
    description: `『${workName}』から新しい金髪ヒロインのキャラクターを登録します。キャラクターを選んで画像をアップロードしてください。`,
    keywords: ['登録', 'フォーム', workName],
    canonical: absoluteUrl({
      url: c.env.PUBLIC_APP_URL,
      path: '/register/character',
    }),
  });

  return c.render(
    <div className='min-h-screen bg-background py-8 px-4'>
      <div className='max-w-xl mx-auto bg-background-light py-8 px-4 rounded-xl shadow-2xl'>
        <h1 className='text-4xl font-bold text-center mb-8 text-primary'>
          キャラクター登録
        </h1>
        <div className='mb-4 text-foreground'>
          <span className='font-medium text-primary'>作品名：</span>
          {workName}
        </div>

        <div className='mb-8 p-6 bg-background-lighter rounded-lg border border-border'>
          <h2 className='text-xl font-bold text-primary mb-4 flex items-center gap-2'>
            <span>✨</span>
            登録の手順
          </h2>
          <div className='space-y-3 text-foreground'>
            <p className='flex items-start gap-2'>
              <span className='text-primary font-medium'>1.</span>
              金髪ヒロインを選択してください👧
            </p>
            <p className='flex items-start gap-2'>
              <span className='text-primary font-medium'>2.</span>
              キャラクターの画像を選択してアップロードしてください🖼️
            </p>
            <p className='flex items-start gap-2'>
              <span className='text-primary font-medium'>3.</span>
              管理者の確認後、サイトに掲載されます🎉
            </p>
          </div>
        </div>
        <form method='post' action='/register/character' id='characterForm'>
          {/*  API実行用の隠しフォーム */}
          <input type='hidden' name='workId' value={workId} />
          <input type='hidden' name='workName' value={workName} />
          <CharacterForm characters={characterData} />
          <ImageUploader />
          <button
            type='submit'
            id='submitButton'
            disabled
            className='w-full bg-primary hover:bg-primary-light text-primary-foreground py-3 px-6 rounded-lg font-bold text-lg transition-all  transform hover:scale-100 disabled:bg-background-lighter disabled:text-foreground-muted disabled:cursor-not-allowed disabled:hover:bg-background-lighter disabled:transform-none shadow-lg'
          >
            登録
          </button>
        </form>
      </div>
    </div>,
    { metadata },
  );
});
