import { err, ok, Result } from 'neverthrow';
import { gql, request } from 'graphql-request';
import { AnnictWorkCharacters } from '@/types/annict';
import { DatabaseError } from '@/types/error';
import { AnnictId } from '@/utils/annict';
import { getRequestHeaders } from '@/utils/getRequestHeaders';

export async function getWorkCharactersById({
  clientId,
  id,
}: {
  clientId: string;
  id: AnnictId;
}): Promise<Result<AnnictWorkCharacters, DatabaseError>> {
  try {
    const query = gql`
        query GetWorkCharacters($ids: [Int!]!) {
          searchWorks(annictIds: $ids) {
            edges {
              node {
                casts {
                  edges {
                    node {
                      character {
                        annictId
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

    // graphql-requestを使用してクエリを実行
    const response = await request<{
      searchWorks: {
        edges: {
          node: {
            casts: {
              edges: {
                node: {
                  character: { annictId: number; name: string };
                };
              }[];
            };
          };
        }[];
      };
    }>(
      'https://api.annict.com/graphql',
      query,
      { ids: [id.val] },
      getRequestHeaders(clientId),
    );

    return ok({
      data: {
        searchWorks: {
          edges: response.searchWorks.edges.map((edge) => ({
            node: {
              casts: {
                edges: edge.node.casts.edges.map((castEdge) => ({
                  node: {
                    character: {
                      annictId: castEdge.node.character.annictId,
                      name: castEdge.node.character.name,
                    },
                  },
                })),
              },
            },
          })),
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return err(new DatabaseError(message, error));
  }
}
