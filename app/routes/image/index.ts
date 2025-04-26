import { uploadImageFile } from '@/lib/storage';
import { ValidationError } from '@/types/error';
import { createRoute } from 'honox/factory';

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

  const result = await uploadImageFile({
    bucket: c.env.R2_BUCKET,
    file: file,
    fileName: fileName,
    arrayBuffer: arrayBuffer,
  });

  return c.json({
    url: `${c.env.R2_ENDPOINT}${result.key}`,
  });
});
