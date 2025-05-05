import { uploadImageFile } from '@/lib/storage';
import { ValidationError } from '@/types/error';
import { createRoute } from 'honox/factory';

// 許可される画像ファイルの形式
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export const POST = createRoute(async (c) => {
  const { logger } = c.var;
  const body = await c.req.parseBody();

  if (typeof body.file === 'string') {
    throw new ValidationError('画像ファイルを添付して下さい');
  }
  const file = body.file;

  // ファイル形式のチェック
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    logger.error({
      message: 'Invalid file type',
      fileType: file.type,
    });
    throw new ValidationError(
      'PNG、JPEG、WEBP形式の画像ファイルのみアップロード可能です。',
    );
  }

  // rename file
  const fileName = `images/${crypto.randomUUID()}_${file.name}`;

  // arrayBuffer to file
  const arrayBuffer = await file.arrayBuffer();

  const result = await uploadImageFile({
    bucket: c.env.R2_BUCKET,
    file: file,
    fileName: fileName,
    arrayBuffer: arrayBuffer,
  });

  logger.info({
    message: `upload image file to ${c.env.R2_ENDPOINT}${result.key}`,
  });

  return c.json({
    url: `${c.env.R2_ENDPOINT}/${result.key}`,
  });
});
