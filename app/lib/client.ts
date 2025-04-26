import { err, ok, Result } from 'neverthrow';
import { NotFoundError } from '../types/error';

export async function fetchRequest(
  url: string,
): Promise<Result<Response, NotFoundError>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return err(
        new NotFoundError(`Failed to fetch page: ${response.statusText}`),
      );
    }

    return ok(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new NotFoundError(message));
  }
}
