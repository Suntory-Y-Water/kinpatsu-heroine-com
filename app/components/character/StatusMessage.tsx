import { AlertMessage } from './AlertMessage';

type StatusMessageProps = {
  status?: 'error' | 'success' | 'info' | 'warning' | null;
  message?: string | null;
};

export function StatusMessage({ status, message }: StatusMessageProps) {
  // ステータスとメッセージがない場合は何も表示しない
  if (!status || !message) {
    return null;
  }

  // デコードされたメッセージを表示
  const decodedMessage = decodeURIComponent(message);

  return <AlertMessage type={status}>{decodedMessage}</AlertMessage>;
}
