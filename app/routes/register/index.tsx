import { createRoute } from 'honox/factory';
import { container } from '../../../src/container';
import { TYPES } from '../../../src/types/symbol-types';
import type { AnnictUsecase } from '../../../src/usecases/annict-usecase';
import type { D1usecase } from '../../../src/usecases/d1usecase';
import { ErrorMessage } from '../../islands/error-message';
import WorkAndCharacterSelector from './$form-selector';
import ImageUploader from './$image-uploader';

// TODO: あるべきはキャラクター名と作品名を画面表示時のAPIで紐づけをして、
// そのIDを送信するようにする
export const POST = createRoute(async (c) => {
  try {
    // フォームデータの解析
    const formData = await c.req.parseBody();

    // 必須フィールドの検証
    const workId = Number(formData.workId);
    const characterId = Number(formData.characterId);
    const imageUrl = String(formData.imageUrl || '');

    if (!workId || !characterId || !imageUrl) {
      return c.render(
        <div className='max-w-3xl mx-auto py-8 px-4'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            <p>すべての必須項目を入力してください。</p>
          </div>
          <a href='/register' className='text-blue-500 hover:underline'>
            登録フォームに戻る
          </a>
        </div>,
      );
    }

    // リクエストボディの作成
    const requestBody = {
      workId,
      characterId,
      imageUrl,
    };

    // キャラクター登録
    const d1usecase = container.get<D1usecase>(TYPES.D1Usecase);

    await d1usecase.createCharacter({
      DB: c.env.DB,
      character: requestBody,
    });

    // 成功時のリダイレクト
    return c.redirect('/register', 303);
  } catch (error) {
    console.error('キャラクター登録エラー:', error);

    return c.render(
      <div className='max-w-3xl mx-auto py-8 px-4'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          <p>キャラクター登録中にエラーが発生しました。</p>
          <p>{error instanceof Error ? error.message : '不明なエラー'}</p>
        </div>
        <a href='/register' className='text-blue-500 hover:underline'>
          登録フォームに戻る
        </a>
      </div>,
    );
  }
});

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

  // TODO: テスト用で10件のみ取得
  const resultList = result.value.annictInfo.slice(0, 100);
  console.log(resultList);

  return c.render(
    <div className='max-w-3xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold text-center mb-8'>キャラクター登録</h1>

      <form
        method='post'
        action='/register'
        className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'
      >
        <WorkAndCharacterSelector works={resultList} />

        <ImageUploader />

        <div className='flex items-center justify-center mt-8'>
          <button
            type='submit'
            className='w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            送信する
          </button>
        </div>
      </form>

      <p className='text-center text-gray-500 text-sm'>
        <a href='/terms' className='text-blue-500 hover:underline'>
          利用規約
        </a>
        および
        <a href='/privacy' className='text-blue-500 hover:underline'>
          プライバシーポリシー
        </a>
        に同意の上、送信してください。
      </p>
    </div>,
  );
});
