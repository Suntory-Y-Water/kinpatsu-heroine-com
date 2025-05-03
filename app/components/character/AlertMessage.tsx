import { ReactNode } from 'hono/jsx';

type AlertMessageProps = {
  type: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  className?: string;
};

export function AlertMessage({ type, children }: AlertMessageProps) {
  const baseStyles =
    'w-full rounded-lg shadow-lg border px-4 py-3 mb-4 flex items-center';

  const typeStyles = {
    error: 'bg-red-900/20 border-red-500 text-red-300',
    success: 'bg-green-900/20 border-green-500 text-green-300',
    info: 'bg-blue-900/20 border-blue-500 text-blue-300',
    warning: 'bg-yellow-900/20 border-yellow-500 text-yellow-300',
  };

  // アイコン
  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <span className='mr-2'>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}
