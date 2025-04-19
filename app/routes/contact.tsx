import { createRoute } from 'honox/factory';

export default createRoute((c) => {
  return c.render(
    <div className='min-h-screen bg-[#1A1F2C] text-[#FFFDE7]'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-[#F3DB5F] mb-8'>お問い合わせ</h1>
        <div className='max-w-2xl mx-auto'>
          <p className='mb-8 text-lg leading-relaxed'>
            サイトに関するご意見、ご感想、誤字脱字の報告、その他お問い合わせは以下のフォームよりお願いいたします。
          </p>

          <div className='bg-[#2a3042] p-8 rounded-lg shadow-lg'>
            {/* TODO: Embed Google Form here */}
            <p className='text-center text-[#FFFDE780]'>
              現在、お問い合わせフォームを準備中です。
              <br />
              (ここにGoogleフォームが埋め込まれます)
            </p>
          </div>
        </div>
      </div>
    </div>,
  );
});
