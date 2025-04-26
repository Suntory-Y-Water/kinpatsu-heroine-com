import { createRoute } from 'honox/factory';
import { pinoLogger, type PinoLogger } from 'hono-pino';

export default createRoute(
  pinoLogger({
    pino: {
      level: 'info',
    },
  }),
);

declare module 'hono' {
  interface ContextVariableMap {
    logger: PinoLogger;
  }
}
