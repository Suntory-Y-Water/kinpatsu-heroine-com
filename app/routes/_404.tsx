import type { NotFoundHandler } from 'hono';

const handler: NotFoundHandler = (c) => {
  c.status(404);
  return c.render(
    <div className='max-w-6xl'>
      <h1 className='text-4xl font-bold text-yellow-300 mb-8'>404 Not Found</h1>
      <p className='text-white'>ページが見つかりませんでした。</p>
    </div>,
  );
};

export default handler;
