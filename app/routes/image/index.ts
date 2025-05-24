import { uploadImageFile } from '@/lib/storage';
import { ValidationError } from '@/types/error';
import { createRoute } from 'honox/factory';

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export const POST = createRoute(async (c) => {
  const { logger } = c.var;

  try {
    const body = await c.req.parseBody();

    if (!body.file) {
      logger.error({ message: 'No file attached' });
      throw new ValidationError('画像ファイルを添付して下さい');
    }

    if (typeof body.file === 'string') {
      logger.error({ message: 'Invalid file format - string received' });
      throw new ValidationError('画像ファイルを添付して下さい');
    }

    const file = body.file;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      logger.error({
        message: 'Invalid file type',
        fileType: file.type,
      });
      throw new ValidationError(
        'PNG、JPEG、WEBP形式の画像ファイルのみアップロード可能です。',
      );
    }

    const fileName = `images/${crypto.randomUUID()}_${file.name}`;
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
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }

    logger.error({
      message: 'Unexpected error during file upload',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return c.json({ error: 'ファイルのアップロードに失敗しました' }, 500);
  }
});
