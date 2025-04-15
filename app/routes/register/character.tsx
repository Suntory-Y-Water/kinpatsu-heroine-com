import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  // 本来はuseStateやuseEffectを使うがレイアウト固定のため仮置き
  const characterName = '';
  const workName = '仮の作品名';
  const imagePreview = null;

  return c.render(
    <div className='max-w-md mx-auto bg-[#232836] p-6 rounded-lg shadow-lg border border-yellow-900/30'>
      <h1 className='text-2xl font-bold text-[#F3DB5F] mb-6'>
        キャラクター登録
      </h1>
      <div className='mb-4 text-[#FFFDE7]'>
        <span className='font-medium'>作品名：</span>
        {workName}
      </div>
      <form>
        <div className='mb-4'>
          <label htmlFor='characterName' className='block text-[#FFFDE7] mb-2'>
            キャラクター名
          </label>
          <input
            type='text'
            id='characterName'
            value={characterName}
            className='w-full bg-[#1A1F2C] border border-yellow-900/30 rounded p-2 text-[#FFFDE7] focus:outline-none focus:ring-1 focus:ring-[#F3DB5F]'
            required
          />
        </div>

        <div className='mb-6'>
          <label htmlFor='characterImage' className='block text-[#FFFDE7] mb-2'>
            キャラクター画像
          </label>
          <div className='flex flex-col items-center'>
            {imagePreview && (
              <div className='mb-4 w-full'>
                <img
                  src={imagePreview}
                  alt='プレビュー'
                  className='w-full max-h-64 object-cover rounded border border-yellow-900/30'
                />
              </div>
            )}
            <label
              htmlFor='characterImage'
              className='w-full cursor-pointer bg-[#1A1F2C] border border-yellow-900/30 rounded p-2 text-[#FFFDE7] text-center hover:bg-[#232836] transition-colors'
            >
              画像を選択
              <input
                id='characterImage'
                type='file'
                accept='image/*'
                className='hidden'
                required
              />
            </label>
          </div>
        </div>

        <button
          type='submit'
          className='w-full bg-[#F3DB5F] text-[#1A1F2C] py-2 px-4 rounded font-medium hover:bg-[#E5CD50] transition-colors'
        >
          登録
        </button>
      </form>
    </div>,
  );
});
