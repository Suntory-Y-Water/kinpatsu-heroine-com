import { ReactNode } from 'hono/jsx';

type AlertMessageProps = {
  type: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  className?: string;
};

export function AlertMessage({ type, children }: AlertMessageProps) {
  const baseStyles =
    'relative max-w-2xl mx-auto rounded-2xl shadow-lg border backdrop-blur-sm px-6 py-4 mb-6 flex items-start gap-4 transform transition-all duration-300 hover:scale-[1.01] overflow-hidden';

  const typeStyles = {
    error:
      'bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border-red-500/40 text-red-100 shadow-red-500/20',
    success:
      'bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 border-green-500/40 text-green-100 shadow-green-500/20',
    info: 'bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30 border-blue-500/40 text-blue-100 shadow-blue-500/20',
    warning:
      'bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 border-yellow-500/40 text-yellow-100 shadow-yellow-500/20',
  };

  // シンプルなアイコン（アニメーションなし）
  const iconConfig = {
    error: {
      icon: '🚨',
      bgColor: 'bg-red-500/20',
    },
    success: {
      icon: '✨',
      bgColor: 'bg-green-500/20',
    },
    info: {
      icon: '💡',
      bgColor: 'bg-blue-500/20',
    },
    warning: {
      icon: '⚡',
      bgColor: 'bg-yellow-500/20',
    },
  };

  const config = iconConfig[type];

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      {/* アイコン部分 */}
      <div
        className={`flex-shrink-0 w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center shadow-md backdrop-blur-sm border border-white/10`}
      >
        <span className='text-lg'>{config.icon}</span>
      </div>

      {/* メッセージ部分 */}
      <div className='flex-1 pt-1'>
        <div className='font-medium text-base leading-relaxed'>{children}</div>
      </div>
    </div>
  );
}
