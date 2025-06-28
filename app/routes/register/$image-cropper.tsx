import { useState, useEffect, useRef } from 'hono/jsx';

interface ImageCropperProps {
  originalImage: string;
  originalFileType: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  originalImage,
  originalFileType,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 250,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);

  // 画像読み込み完了時の処理
  useEffect(() => {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      const containerWidth = 400;
      const aspectRatio = img.width / img.height;
      const displayWidth = containerWidth;
      const displayHeight = containerWidth / aspectRatio;

      setImageSize({ width: displayWidth, height: displayHeight });

      // 初期のトリミング領域を画像中央に設定（4:5の比率）
      const maxCropWidth = displayWidth * 0.6;
      const maxCropHeight = displayHeight * 0.6;
      const cropRatio = 4 / 5;

      let cropWidth = maxCropWidth;
      let cropHeight = cropWidth / cropRatio;

      if (cropHeight > maxCropHeight) {
        cropHeight = maxCropHeight;
        cropWidth = cropHeight * cropRatio;
      }

      setCropArea({
        x: (displayWidth - cropWidth) / 2,
        y: (displayHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    };
    img.src = originalImage;
  }, [originalImage]);

  // ドラッグ開始
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    const rect = cropperRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y,
      });
    }
  };

  // ドラッグ中
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !cropperRef.current) return;

    const rect = cropperRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;

    // 境界チェック
    const maxX = imageSize.width - cropArea.width;
    const maxY = imageSize.height - cropArea.height;

    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    }));
  };

  // ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 画像のトリミング処理
  const handleCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 表示サイズと実際の画像サイズの比率を計算
    const scaleX = image.naturalWidth / imageSize.width;
    const scaleY = image.naturalHeight / imageSize.height;

    // トリミング領域を実際の画像サイズに変換
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    canvas.width = 400;
    canvas.height = 500; // 4:5の比率

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      400,
      500,
    );

    const outputMimeType = originalFileType;
    const outputQuality = originalFileType === 'image/png' ? undefined : 1.0;

    const getFileExtension = (mimeType: string) => {
      if (mimeType === 'image/png') return '.png';
      if (mimeType === 'image/webp') return '.webp';
      return '.jpg';
    };

    const fileExtension = getFileExtension(originalFileType);

    // canvasからBlobを取得
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        try {
          const formData = new FormData();
          formData.append('file', blob, `cropped_image${fileExtension}`);

          const response = await fetch('/image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('画像のアップロードに失敗しました');
          }
          const result = await response.json<{ url: string }>();
          onCropComplete(result.url);
        } catch (error) {
          if (error instanceof Error) {
            console.error(`画像アップロードエラー:${error.message}`);
          }
          alert('画像のアップロードに失敗しました。再度お試しください。');
        }
      },
      outputMimeType,
      outputQuality,
    );
  };

  // マウスイベントリスナーの設定
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, cropArea.width, cropArea.height, imageSize]);

  return (
    <div className='space-y-4'>
      <div className='bg-background-lighter p-4 rounded-lg border border-border'>
        <p className='text-foreground text-sm mb-3'>
          画像を4:5の比率にトリミングします。点線の枠をドラッグして位置を調整できます。
        </p>

        <div className='flex justify-center mb-4'>
          <div
            ref={cropperRef}
            className='relative inline-block'
            style={{ width: imageSize.width, height: imageSize.height }}
          >
            <img
              ref={imageRef}
              src={originalImage}
              alt='元画像'
              className='block w-full h-full object-contain rounded-lg border border-border'
              crossOrigin='anonymous'
              draggable={false}
              style={{ width: imageSize.width, height: imageSize.height }}
            />

            {/* ドラッグ可能なトリミング枠 */}
            <div
              className='absolute border-2 border-primary cursor-move'
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              }}
              onMouseDown={handleMouseDown}
            >
              <div className='absolute inset-0 border border-white border-dashed' />
              {isDragging && (
                <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded whitespace-nowrap'>
                  ドラッグして移動
                </div>
              )}
            </div>

            {/* 外側の暗いオーバーレイ */}
            <div
              className='absolute pointer-events-none'
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: cropArea.y,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
            <div
              className='absolute pointer-events-none'
              style={{
                top: cropArea.y + cropArea.height,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
            <div
              className='absolute pointer-events-none'
              style={{
                top: cropArea.y,
                left: 0,
                width: cropArea.x,
                height: cropArea.height,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
            <div
              className='absolute pointer-events-none'
              style={{
                top: cropArea.y,
                left: cropArea.x + cropArea.width,
                right: 0,
                height: cropArea.height,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>

        <div className='flex gap-3 justify-center'>
          <button
            type='button'
            onClick={handleCrop}
            className='bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300'
          >
            ✂️ トリミング実行
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='bg-background-light hover:bg-background-lighter border border-border text-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-300'
          >
            キャンセル
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
}
