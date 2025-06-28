import { useState, useEffect } from 'hono/jsx';
import ImageCropper from './$image-cropper';

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const MAX_WIDTH_FOR_DIRECT_UPLOAD = 400;
const MAX_HEIGHT_FOR_DIRECT_UPLOAD = 500;
const TARGET_ASPECT_RATIO = 0.8; // 4:5の比率
const ASPECT_RATIO_TOLERANCE = 0.1;

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFileType, setOriginalFileType] = useState<string>('');

  const uploadImageFile = async (file: File) => {
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
    return result.url;
  };

  const handleDirectUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadImageFile(file);
      setImageUrl(uploadedUrl);
      setPreview(URL.createObjectURL(file));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`画像アップロードエラー:${error.message}`);
      }
      alert('画像のアップロードに失敗しました。再度お試しください。');
    }
  };

  const shouldSkipCropping = (width: number, height: number) => {
    const isSmallImage =
      width <= MAX_WIDTH_FOR_DIRECT_UPLOAD &&
      height <= MAX_HEIGHT_FOR_DIRECT_UPLOAD;
    const aspectRatio = width / height;
    const isCorrectRatio =
      Math.abs(aspectRatio - TARGET_ASPECT_RATIO) < ASPECT_RATIO_TOLERANCE;

    return isSmallImage || isCorrectRatio;
  };

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

      const img = new Image();
      img.onload = () => {
        if (shouldSkipCropping(img.width, img.height)) {
          handleDirectUpload(file);
        } else {
          setShowCropper(true);
        }
      };
      img.src = imageDataUrl;
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
