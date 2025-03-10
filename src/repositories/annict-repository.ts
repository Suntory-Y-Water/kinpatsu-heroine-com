import { gql, request } from 'graphql-request';

import { injectable } from 'inversify';

import { type Result, err, ok } from 'neverthrow';
import type { AnnictId } from '../domain/value_object/annict';
import type { AnnictWorkCharacters, AnnictWorks } from '../types/annict';
import { DatabaseError } from '../types/error';

export interface AnnictRepository {
  /**
   * @description 作品一覧を取得する
   */
  getWorks(p: { clientId: string }): Promise<
    Result<AnnictWorks, DatabaseError>
  >;

  /**
   * @description 作品IDに紐づくキャラクター一覧を取得する
   */
  getWorkCharactersById(p: {
    clientId: string;
    id: AnnictId;
  }): Promise<Result<AnnictWorkCharacters, DatabaseError>>;
}

@injectable()
export class AnnictRepositoryImpl implements AnnictRepository {
  /**
   * @description GraphQLリクエストを実行するための設定を作成
   */
  private getRequestHeaders(clientId: string): { Authorization: string } {
    if (!clientId) {
      throw new Error('ANNICT_CLIENT_ID is required');
    }

    return {
      Authorization: `Bearer ${clientId}`,
    };
  }

  async getWorkCharactersById(p: {
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
        { ids: [p.id.val] },
        this.getRequestHeaders(p.clientId),
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
      console.error(`Error occurred while fetching works: ${message}`);
      return err(new DatabaseError(message, error));
    }
  }

  async getWorks(p: { clientId: string }): Promise<
    Result<AnnictWorks, DatabaseError>
  > {
    try {
      const query = gql`
      query GetWorks {
        searchWorks(orderBy: { field: CREATED_AT, direction: DESC }) {
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
        this.getRequestHeaders(p.clientId),
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error occurred while fetching works: ${message}`);
      return err(new DatabaseError(message));
    }
  }
}
