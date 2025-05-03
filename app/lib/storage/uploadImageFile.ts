export async function uploadImageFile({
  bucket,
  file,
  fileName,
  arrayBuffer,
}: {
  bucket: R2Bucket;
  file: File;
  fileName: string;
  arrayBuffer: ArrayBuffer;
}): Promise<R2Object> {
  const result = await bucket.put(fileName, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });
  return result;
}
