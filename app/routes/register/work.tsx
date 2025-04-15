import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  // 本来はuseStateを使うがレイアウト固定のため仮置き
  const workName = '';

  return c.render(
    <div className='max-w-md mx-auto bg-[#232836] p-6 rounded-lg shadow-lg border border-yellow-900/30'>
      <h1 className='text-2xl font-bold text-[#F3DB5F] mb-6'>作品登録</h1>
      <form>
        <div className='mb-4'>
          <label htmlFor='workName' className='block text-[#FFFDE7] mb-2'>
            作品名
          </label>
          <input
            type='text'
            id='workName'
            value={workName}
            className='w-full bg-[#1A1F2C] border border-gray-700 rounded p-2 text-[#FFFDE7]'
            required
          />
        </div>
        <a href='/register/character'>
          <button
            type='button'
            className='w-full bg-[#F3DB5F] text-[#1A1F2C] py-2 px-4 rounded font-medium hover:bg-[#E5CD50] transition-colors'
          >
            次へ
          </button>
        </a>
      </form>
    </div>,
  );
});
