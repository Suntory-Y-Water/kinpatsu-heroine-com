import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-4'>
        <h1 className='text-3xl font-bold text-center mb-4'>お問い合わせ</h1>
        <div className='max-w-2xl mx-auto'>
          <p className='mb-8 text-lg leading-relaxed'>
            サイトに関するご意見、ご感想、誤字脱字の報告、その他お問い合わせは以下のフォームよりお願いいたします。
          </p>

          <div className='bg-gray-900 p-8 rounded-lg shadow-lg'>
            {/* TODO: Embed Google Form here */}
            <p className='text-center text-yellow-50/50'>
              現在、お問い合わせフォームを準備中です。
            </p>
          </div>
        </div>
      </div>
    </div>,
  );
});
