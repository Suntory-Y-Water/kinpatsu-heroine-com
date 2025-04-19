import { err, ok } from 'neverthrow';
import { ValidationError } from '../../types/error';
import type { Result } from 'neverthrow';

const annictIdBrand = Symbol();

type AnnictIdPrimitive = number & { [annictIdBrand]: unknown };

export interface AnnictId {
  readonly _type: 'AnnictId';
  readonly val: AnnictIdPrimitive;
}

export const createAnnictId = (
  value: number,
): Result<AnnictId, ValidationError> => {
  if (value <= 0) {
    return err(
      new ValidationError('キャラクターIDは正の整数である必要があります'),
    );
  }

  // 5桁より大きいIDはAnnictのIDとして不正
  if (value > 99999) {
    return err(
      new ValidationError('キャラクターIDは5桁以下である必要があります'),
    );
  }

  return ok({ _type: 'AnnictId', val: value as AnnictIdPrimitive });
};
