import type { PropsWithChildren } from 'hono/jsx';

interface PolicyLayoutProps {
  title: string;
}

export function PolicyLayout(props: PropsWithChildren<PolicyLayoutProps>) {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto bg-background-light p-8 rounded-xl shadow-2xl border border-primary'>
          <h1 className='text-4xl font-bold text-primary mb-8 text-center border-b border-primary pb-6'>
            {props.title}
          </h1>
          <div className='prose prose-invert max-w-none space-y-8 text-foreground leading-relaxed'>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
