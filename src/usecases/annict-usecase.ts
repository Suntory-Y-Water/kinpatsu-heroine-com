import { inject, injectable } from 'inversify';
import { type Result, err, ok } from 'neverthrow';
import type { AnnictId } from '../domain/value_object/annict';

import type { AnnictRepository } from '../repositories/annict-repository';
import type { AnnictWorkCharacters, AnnictWorksDTO } from '../types/annict';
import type { DatabaseError } from '../types/error';
import { TYPES } from '../types/symbol-types';

@injectable()
export class AnnictUsecase {
  constructor(
    @inject(TYPES.AnnictRepository) private annictRepository: AnnictRepository,
  ) {}

  async getWorks(p: {
    clientId: string;
  }): Promise<Result<AnnictWorksDTO, DatabaseError>> {
    const result = await this.annictRepository.getWorks(p);
    if (result.isErr()) {
      return err(result.error);
    }

    const value = {
      annictInfo: result.value.data.searchWorks.nodes.map((node) => ({
        annictId: node.annictId,
        title: node.title,
      })),
    };

    // キー情報と画面に表示する作品名を返却する
    return ok(value);
  }

  async getWorkCharactersById(p: {
    clientId: string;
    id: AnnictId;
  }): Promise<Result<AnnictWorkCharacters, DatabaseError>> {
    const result = await this.annictRepository.getWorkCharactersById(p);

    if (result.isErr()) {
      return err(result.error);
    }

    const value = {
      data: {
        searchWorks: {
          edges: result.value.data.searchWorks.edges.map((edge) => ({
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
    // 作品IDを元にキー情報と画面に表示するキャラクター名を返却する
    return ok(value);
  }
}
