export function absoluteUrl({
  url,
  path,
}: {
  url: string | null;
  path: string;
}) {
  return `${url ?? 'http://localhost:5173'}${path}`;
}
