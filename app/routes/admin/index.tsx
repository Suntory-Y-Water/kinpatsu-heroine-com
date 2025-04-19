import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-yellow-200 mb-8'>
          認証画面のデモ
        </h1>
        <div className='prose prose-invert max-w-none space-y-4 text-lg leading-relaxed'>
          <p>これは管理画面のデモです。</p>
        </div>
      </div>
    </div>,
  );
});
