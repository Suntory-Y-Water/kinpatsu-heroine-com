export interface R2Repository {
  /**
   * @description 画像ファイルをR2バケットにアップロードします。
   */
  uploadImageFile(p: {
    bucket: R2Bucket;
    file: File;
    fileName: string;
    arrayBuffer: ArrayBuffer;
  }): Promise<R2Object>;
}

export class R2RepositoryImpl implements R2Repository {
  async uploadImageFile(p: {
    bucket: R2Bucket;
    file: File;
    fileName: string;
    arrayBuffer: ArrayBuffer;
  }): Promise<R2Object> {
    const result = await p.bucket.put(p.fileName, p.arrayBuffer, {
      httpMetadata: {
        contentType: p.file.type,
      },
    });
    return result;
  }
}
