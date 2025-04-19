import { createRoute } from 'honox/factory';
import { container } from '../../../../src/container';
import type { AnnictUsecase } from '../../../../src/usecases/annict-usecase';
import { TYPES } from '../../../../src/types/symbol-types';
import { ErrorMessage } from '../../../islands/error-message';
import WorkForm from './$work-form';

import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

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
  const annictUsecase = container.get<AnnictUsecase>(TYPES.AnnictUsecase);
  const result = await annictUsecase.getWorks({
    clientId: c.env.ANNICT_CLIENT_ID,
  });

  if (result.isErr()) {
    return c.render(<ErrorMessage error={result.error} />);
  }

  // 登録しているキャラクター情報を取得
  // TODO: テスト用でid=9244だけを取得
  const resultList = result.value.annictInfo.filter(
    (work) => work.annictId === 9244,
  );

  return c.render(
    <div className='max-w-md mx-auto bg-[#232836] p-6 rounded-lg shadow-lg border border-yellow-900/30'>
      <h1 className='text-2xl font-bold text-[#F3DB5F] mb-6'>作品登録</h1>
      <form method='post' action='/register/work'>
        <WorkForm works={resultList} />
        <button
          type='submit'
          className='w-full bg-[#F3DB5F] text-[#1A1F2C] py-2 px-4 rounded font-medium hover:bg-[#E5CD50] transition-colors'
        >
          次へ
        </button>
      </form>
    </div>,
  );
});
