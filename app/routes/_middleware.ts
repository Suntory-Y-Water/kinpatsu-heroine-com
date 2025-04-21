import { logger } from 'hono/logger';
import { createRoute } from 'honox/factory';

export function customLogger(message: string, ...rest: string[]) {
  const timestamp = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  console.log(`[${timestamp}] ${message}`, ...rest);
}

export default createRoute(logger(customLogger));
