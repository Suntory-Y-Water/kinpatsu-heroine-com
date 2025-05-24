import type { PropsWithChildren } from 'hono/jsx';

interface PolicyLayoutProps {
  title: string;
}

export function PolicyLayout(props: PropsWithChildren<PolicyLayoutProps>) {
  return (
    <div className='min-h-screen bg-gray-800'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto bg-gray-700 p-8 rounded-xl shadow-2xl border border-yellow-400'>
          <h1 className='text-4xl font-bold text-yellow-300 mb-8 text-center border-b border-yellow-400 pb-6'>
            {props.title}
          </h1>
          <div className='prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed'>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
