import { useState, useEffect } from 'hono/jsx';
import ImageCropper from './$image-cropper';

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
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFileType, setOriginalFileType] = useState<string>('');

  // ファイル選択時の処理
  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      setPreview(null);
      setOriginalImage(null);
      setShowCropper(false);
      return;
    }

    // ファイル形式のチェック
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('PNG、JPEG、WEBP形式の画像ファイルのみアップロード可能です。');
      input.value = '';
      return;
    }

    // 元のファイル形式を記録
    setOriginalFileType(file.type);

    // プレビュー用のURLを作成
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setOriginalImage(imageDataUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // トリミング完了時の処理
  const handleCropComplete = (croppedImageUrl: string) => {
    setImageUrl(croppedImageUrl);
    setPreview(croppedImageUrl);
    setShowCropper(false);
  };

  // トリミングをキャンセル
  const handleCancelCrop = () => {
    setShowCropper(false);
    setOriginalImage(null);
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

      {!showCropper ? (
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
                className='w-32 h-40 object-cover rounded-lg border-2 border-primary shadow-lg'
              />
              <p className='text-primary text-sm mt-2 font-medium'>
                ✓ 画像が選択されました
              </p>
            </div>
          )}
        </div>
      ) : (
        <ImageCropper
          originalImage={originalImage || ''}
          originalFileType={originalFileType}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
        />
      )}

      <p className='text-foreground-muted text-sm mt-3'>
        ※PNG、JPEG、WEBP形式のファイルがアップロード可能です。画像は4:5の比率にトリミングされます。
      </p>

      {/* 画像URLを保持する隠しフィールド */}
      <input type='hidden' name='imageUrl' value={imageUrl} />
    </div>
  );
}
