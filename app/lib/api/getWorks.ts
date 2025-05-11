import { ok, Result } from 'neverthrow';
import { AnnictWorks } from '../../types/annict';
import { DatabaseError, databaseErrorHandler } from '../../types/error';
import { gql, request } from 'graphql-request';
import { getRequestHeaders } from '@/utils/getRequestHeaders';

export async function getWorks({
  clientId,
}: {
  clientId: string;
}): Promise<Result<AnnictWorks, DatabaseError>> {
  try {
    const query = gql`
        query GetWorks {
          searchWorks(orderBy: { field: CREATED_AT, direction: ASC }) {
            nodes {
              annictId
              title
            }
          }
        }
      `;

    // graphql-requestを使用してクエリを実行
    const response = await request<{
      searchWorks: { nodes: { annictId: number; title: string }[] };
    }>(
      'https://api.annict.com/graphql',
      query,
      {},
      getRequestHeaders(clientId),
    );

    return ok({
      data: {
        searchWorks: {
          nodes: response.searchWorks.nodes.map((node) => ({
            annictId: node.annictId,
            title: node.title,
          })),
        },
      },
    });
  } catch (error) {
    return databaseErrorHandler(error);
  }
}
