import { inject, injectable } from 'inversify';
import type { R2Repository } from '../repositories/r2repository';
import { TYPES } from '../types/symbol-types';

@injectable()
export class R2usecase {
  constructor(@inject(TYPES.R2Repository) private r2Repository: R2Repository) {}

  async uploadImageFile(p: {
    bucket: R2Bucket;
    file: File;
    fileName: string;
    arrayBuffer: ArrayBuffer;
  }): Promise<R2Object> {
    return await this.r2Repository.uploadImageFile(p);
  }
}
