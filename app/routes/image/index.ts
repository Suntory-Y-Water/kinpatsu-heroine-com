import { createRoute } from 'honox/factory';
import { container } from '../../../src/container';
import { ValidationError } from '../../../src/types/error';
import { TYPES } from '../../../src/types/symbol-types';
import type { R2usecase } from '../../../src/usecases/r2usecase';

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

  const r2usecase = container.get<R2usecase>(TYPES.R2Usecase);

  const result = await r2usecase.uploadImageFile({
    bucket: c.env.R2_BUCKET,
    file: file,
    fileName: fileName,
    arrayBuffer: arrayBuffer,
  });

  return c.json({
    url: `${c.env.R2_ENDPOINT}${result.key}`,
  });
});
