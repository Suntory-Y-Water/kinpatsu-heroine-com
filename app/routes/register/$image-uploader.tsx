import { useState } from 'hono/jsx';

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // ファイル選択時の処理
  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      setPreview(null);
      return;
    }

    // プレビュー用のURLを作成
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 画像のアップロード処理
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }
      const result = (await response.json()) as { url: string };
      setImageUrl(result.url);
    } catch (error) {
      if (error instanceof Error) {
        console.error('画像アップロードエラー:', error.message);
      }
      alert('画像のアップロードに失敗しました。再度お試しください。');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='mb-4'>
      <label
        htmlFor='image-upload'
        className='block text-gray-700 text-sm font-bold mb-2'
      >
        画像添付
      </label>
      <div className='flex flex-col items-start'>
        <label
          className={`bg-white border border-gray-400 rounded py-2 px-4 text-gray-700 cursor-pointer hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? '画像をアップロード中...' : '画像を選択する'}
          <input
            type='file'
            className='hidden'
            accept='image/*'
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {preview && (
          <div className='mt-2'>
            <img
              src={preview}
              alt='プレビュー'
              className='w-32 h-32 object-cover rounded border border-gray-200'
            />
          </div>
        )}
      </div>
      <p className='text-gray-500 text-xs'>
        ※JPEG、PNG形式のファイルがアップロード可能です
      </p>

      {/* 画像URLを保持する隠しフィールド */}
      <input type='hidden' name='imageUrl' value={imageUrl} />
    </div>
  );
}
