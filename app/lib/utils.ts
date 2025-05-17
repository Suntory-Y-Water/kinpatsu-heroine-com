export function absoluteUrl({
  url,
  path,
}: {
  url: string | null;
  path: string;
}) {
  return `${url ?? 'http://localhost:5173'}${path}`;
}

/**
 * @description GraphQLリクエストを実行するための設定を作成
 */
export function getRequestHeaders(clientId: string): { Authorization: string } {
  if (!clientId) {
    throw new Error('ANNICT_CLIENT_ID is required');
  }

  return {
    Authorization: `Bearer ${clientId}`,
  };
}
