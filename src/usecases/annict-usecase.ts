import { inject, injectable } from 'inversify';
import type { AnnictId } from '../domain/value_object/annict';
import type { AnnictRepository } from '../repositories/annict-repository';
import type { AnnictWorkCharacters, AnnictWorksDTO } from '../types/annict';
import { TYPES } from '../types/symbol-types';

@injectable()
export class AnnictUsecase {
  constructor(
    @inject(TYPES.AnnictRepository) private annictRepository: AnnictRepository,
  ) {}

  async getWorks(p: { clientId: string }): Promise<AnnictWorksDTO> {
    const result = await this.annictRepository.getWorks(p);
    return {
      annictInfo: result.data.searchWorks.nodes.map((node) => ({
        annictId: node.annictId,
        name: node.name,
      })),
    };
  }

  async getWorkCharactersById(p: {
    clientId: string;
    id: AnnictId;
  }): Promise<AnnictWorkCharacters> {
    const result = await this.annictRepository.getWorkCharactersById(p);
    return {
      data: {
        searchWorks: {
          edges: result.data.searchWorks.edges.map((edge) => ({
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
}
