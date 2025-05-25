import { useState, useEffect } from 'hono/jsx';

// 許可される画像ファイルの形式
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // ファイル選択時の処理
  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      setPreview(null);
      return;
    }

    // ファイル形式のチェック
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('PNG、JPEG、WEBP形式の画像ファイルのみアップロード可能です。');
      input.value = '';
      return;
    }

    // プレビュー用のURLを作成
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

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
      const result = await response.json<{ url: string }>();
      setImageUrl(result.url);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`画像アップロードエラー:${error.message}`);
      }
      alert('画像のアップロードに失敗しました。再度お試しください。');
    }
  };

  function validateForm() {
    const submitButton = document.getElementById(
      'submitButton',
    ) as HTMLButtonElement | null;
    const characterName = document.querySelector(
      'select[name="characterName"]',
    ) as HTMLSelectElement | null;

    if (!submitButton || !characterName) return;

    const isValid = characterName.value !== '' && imageUrl !== '';
    submitButton.disabled = !isValid;
  }

  useEffect(() => {
    validateForm();
  }, [imageUrl]);

  return (
    <div className='mb-6'>
      <label
        htmlFor='image-upload'
        className='block text-primary font-medium mb-3'
      >
        画像添付
      </label>
      <div className='flex flex-col items-start'>
        <label className='bg-background-light hover:bg-background-lighter border border-border hover:border-primary font-medium rounded-lg py-3 px-6 text-foreground cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg'>
          <input
            type='file'
            className='hidden'
            accept='image/png,image/jpeg,image/webp'
            onChange={handleFileChange}
          />
          📷 画像を選択する
        </label>

        {preview && (
          <div className='mt-4'>
            <img
              src={preview}
              alt='プレビュー'
              className='w-32 h-32 object-cover rounded-lg border-2 border-primary shadow-lg'
            />
            <p className='text-primary text-sm mt-2 font-medium'>
              ✓ 画像が選択されました
            </p>
          </div>
        )}
      </div>
      <p className='text-foreground-muted text-sm mt-3'>
        ※PNG、JPEG、WEBP形式のファイルがアップロード可能です
      </p>

      {/* 画像URLを保持する隠しフィールド */}
      <input type='hidden' name='imageUrl' value={imageUrl} />
    </div>
  );
}
