import { createRoute } from 'honox/factory';
import { ValidationError } from '../../../src/types/error';

export const POST = createRoute(async (c) => {
  const body = await c.req.parseBody();

  if (typeof body.file === 'string') {
    throw new ValidationError('画像ファイルを添付して下さい');
  }
  const file = body.file;

  // rename file
  const fileName = `/images/${crypto.randomUUID()}_${file.name}`;

  // arrayBuffer to file
  const arrayBuffer = await file.arrayBuffer();

  // upload file to R2
  const result = await c.env.R2_BUCKET.put(fileName, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return c.json({
    url: `${c.env.R2_ENDPOINT}${result.key}`,
  });
});
