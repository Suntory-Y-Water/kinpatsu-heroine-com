import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { injectable } from 'inversify';
import type { AnnictId } from '../domain/value_object/annict';
import type { AnnictWorkCharacters, AnnictWorks } from '../types/annict';

export interface AnnictRepository {
  /**
   * @description 作品一覧を取得する
   */
  getWorks(p: { clientId: string }): Promise<AnnictWorks>;

  /**
   * @description 作品IDに紐づくキャラクター一覧を取得する
   */
  getWorkCharactersById(p: {
    clientId: string;
    id: AnnictId;
  }): Promise<AnnictWorkCharacters>;
}

@injectable()
export class AnnictRepositoryImpl implements AnnictRepository {
  private createClient(clientId: string): ApolloClient<unknown> {
    if (!clientId) {
      throw new Error('ANNICT_CLIENT_ID is required');
    }

    return new ApolloClient({
      link: new HttpLink({
        uri: 'https://api.annict.com/graphql',
        headers: {
          Authorization: `Bearer ${clientId}`,
        },
      }),
      cache: new InMemoryCache(),
    });
  }

  async getWorkCharactersById(p: {
    clientId: string;
    id: AnnictId;
  }): Promise<AnnictWorkCharacters> {
    const client = this.createClient(p.clientId);

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

    const response = await client.query<{
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
    }>({
      query,
      variables: { ids: [p.id.val] },
    });

    return {
      data: {
        searchWorks: {
          edges: response.data.searchWorks.edges.map((edge) => ({
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
    };
  }

  async getWorks(p: { clientId: string }): Promise<AnnictWorks> {
    const client = this.createClient(p.clientId);

    const query = gql`
    query GetWorks {
      searchWorks(orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          annictId
        }
      }
    }
    `;

    const response = await client.query<{
      searchWorks: { nodes: { annictId: number; name: string }[] };
    }>({
      query,
    });

    return {
      data: {
        searchWorks: {
          nodes: response.data.searchWorks.nodes.map((node) => ({
            annictId: node.annictId,
            name: node.name,
          })),
        },
      },
    };
  }
}
