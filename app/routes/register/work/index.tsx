import { createRoute } from 'honox/factory';
import WorkForm from './$work-form';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getWorks } from '@/lib/api';

const workFormSchema = z.object({
  workId: z.string().min(1, { message: '作品IDは必須です' }),
  workName: z.string().min(1, { message: '作品名は必須です' }),
});

export const POST = createRoute(
  zValidator('form', workFormSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.redirect('/register/work');
    }
  }),
  async (c) => {
    const { workId, workName } = await c.req.valid('form');
    return c.redirect(
      `/register/character?workId=${workId}&workName=${encodeURIComponent(
        workName,
      )}`,
    );
  },
);

export default createRoute(async (c) => {
  // キャラクター登録画面から、現在登録していない作品を取得します。
  // annictから作品情報を取得
  const result = await getWorks({
    clientId: c.env.ANNICT_CLIENT_ID,
  });

  if (result.isErr()) {
    throw new Error('作品情報の取得に失敗しました');
  }

  const resultList = result.value.data.searchWorks.nodes.map((node) => ({
    annictId: node.annictId,
    title: node.title,
  }));

  return c.render(
    <div className='max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg'>
      <h1 className='text-3xl font-bold text-center mb-8 text-white'>
        作品登録
      </h1>
      <form method='post' action='/register/work'>
        <WorkForm works={resultList} />
        <button
          type='submit'
          className='w-full bg-yellow-300 text-gray-900 py-2 px-4 rounded font-medium hover:bg-yellow-500 transition-colors'
        >
          次へ
        </button>
      </form>
    </div>,
  );
});
