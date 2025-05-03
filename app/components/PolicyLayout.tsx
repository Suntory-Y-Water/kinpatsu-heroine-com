import type { PropsWithChildren } from 'hono/jsx';

interface PolicyLayoutProps {
  title: string;
}

export function PolicyLayout(props: PropsWithChildren<PolicyLayoutProps>) {
  return (
    <div className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-4'>
        <h1 className='text-3xl font-bold text-yellow-300 mb-8'>
          {props.title}
        </h1>
        <div className='prose prose-invert max-w-none space-y-6 text-lg leading-relaxed'>
          {props.children}
        </div>
      </div>
    </div>
  );
}
