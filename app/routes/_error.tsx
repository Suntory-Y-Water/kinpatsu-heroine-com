import type { ErrorHandler } from 'hono';

const handler: ErrorHandler = (e, c) => {
  if ('getResponse' in e) {
    return e.getResponse();
  }
  console.error(e.message);
  c.status(500);
  return c.render(
    <div className='max-w-6xl'>
      <h1 className='text-4xl font-bold text-yellow-200 mb-8'>
        通信エラーが発生しました。
      </h1>
      <p className='text-white'>しばらく経ってから再度アクセスしてください。</p>
    </div>,
  );
};

export default handler;
