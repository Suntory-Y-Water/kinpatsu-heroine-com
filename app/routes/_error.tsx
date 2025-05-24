import type { ErrorHandler } from 'hono';

const handler: ErrorHandler = (e, c) => {
  if ('getResponse' in e) {
    return e.getResponse();
  }
  console.error(e.message);
  console.error(e.stack);
  c.status(500);
  return c.render(
    <div className='min-h-screen bg-gray-800 flex items-center justify-center py-8 px-4'>
      <div className='max-w-2xl mx-auto bg-gray-700 p-8 rounded-xl shadow-2xl border border-yellow-400 text-center'>
        <div className='text-8xl mb-6'>⚠️</div>
        <h1 className='text-4xl font-bold text-yellow-300 mb-6'>
          通信エラーが発生しました
        </h1>
        <p className='text-gray-300 text-lg mb-8 leading-relaxed'>
          しばらく経ってから再度アクセスしてください。
        </p>

        <div className='space-y-4'>
          <a
            href='/'
            className='inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
          >
            🏠 ホームに戻る
          </a>

          <div className='bg-gray-600 p-6 rounded-lg border border-gray-500'>
            <h2 className='text-xl font-bold text-yellow-300 mb-3 flex items-center justify-center gap-2'>
              <span>🔧</span>
              エラーが続く場合
            </h2>
            <ul className='text-gray-300 space-y-2 text-left'>
              <li>• ブラウザを更新してください</li>
              <li>• しばらく時間をおいてからアクセスしてください</li>
              <li>• 問題が続く場合はお問い合わせください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
  );
};

export default handler;
