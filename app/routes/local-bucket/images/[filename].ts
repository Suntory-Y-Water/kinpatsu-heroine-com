// ※ローカル時の画像表示用エンドポイント
import { createRoute } from 'honox/factory';

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return types[ext || ''] || 'application/octet-stream';
}

export const GET = createRoute(async (c) => {
  const filename = c.req.param('filename');
  const file = await c.env.R2_BUCKET.get(`/images/${filename}`);

  if (!file) {
    return c.notFound();
  }

  const contentType = getContentType(filename);

  return new Response(file.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
});
