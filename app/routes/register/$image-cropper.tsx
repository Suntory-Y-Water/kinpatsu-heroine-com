import { useState, useEffect, useRef } from 'hono/jsx';

interface ImageCropperProps {
  originalImage: string;
  originalFileType: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  cursor: string;
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
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
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

      // 初期のトリミング領域を画像中央に設定（4:5の比率、より大きなサイズで開始）
      const maxCropWidth = displayWidth * 0.8; // 0.6から0.8に変更
      const maxCropHeight = displayHeight * 0.8; // 0.6から0.8に変更
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

  // ドラッグ開始（マウス・タッチ対応）
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    const rect = cropperRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: clientX - rect.left - cropArea.x,
        y: clientY - rect.top - cropArea.y,
      });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStartDrag(touch.clientX, touch.clientY);
  };

  // リサイズ開始（マウス・タッチ対応）
  const handleStartResize = (
    clientX: number,
    clientY: number,
    handle: string,
  ) => {
    setIsResizing(true);
    setResizeHandle(handle);
    setInitialCropArea({ ...cropArea });
    const rect = cropperRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  const handleResizeStart = (e: MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleStartResize(e.clientX, e.clientY, handle);
  };

  const handleResizeTouchStart = (e: TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    handleStartResize(touch.clientX, touch.clientY, handle);
  };

  // 移動・リサイズ処理（マウス・タッチ共通）
  const handleMove = (clientX: number, clientY: number) => {
    if (!cropperRef.current) return;

    const rect = cropperRef.current.getBoundingClientRect();
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    if (isDragging) {
      const newX = currentX - dragStart.x;
      const newY = currentY - dragStart.y;

      // 境界チェック
      const maxX = imageSize.width - cropArea.width;
      const maxY = imageSize.height - cropArea.height;

      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }));
    } else if (isResizing) {
      handleResize(currentX, currentY);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // リサイズ処理
  const handleResize = (currentX: number, currentY: number) => {
    const deltaX = currentX - dragStart.x;
    const _deltaY = currentY - dragStart.y;
    const aspectRatio = 4 / 5;

    const newCropArea = { ...initialCropArea };

    switch (resizeHandle) {
      case 'se': // 右下
        newCropArea.width = Math.max(50, initialCropArea.width + deltaX);
        newCropArea.height = newCropArea.width / aspectRatio;
        break;
      case 'sw': {
        // 左下
        const newWidth = Math.max(50, initialCropArea.width - deltaX);
        newCropArea.width = newWidth;
        newCropArea.height = newWidth / aspectRatio;
        newCropArea.x = initialCropArea.x + (initialCropArea.width - newWidth);
        break;
      }
      case 'ne': {
        // 右上
        const neWidth = Math.max(50, initialCropArea.width + deltaX);
        newCropArea.width = neWidth;
        newCropArea.height = neWidth / aspectRatio;
        newCropArea.y =
          initialCropArea.y + initialCropArea.height - newCropArea.height;
        break;
      }
      case 'nw': {
        // 左上
        const nwWidth = Math.max(50, initialCropArea.width - deltaX);
        newCropArea.width = nwWidth;
        newCropArea.height = nwWidth / aspectRatio;
        newCropArea.x = initialCropArea.x + (initialCropArea.width - nwWidth);
        newCropArea.y =
          initialCropArea.y + initialCropArea.height - newCropArea.height;
        break;
      }
    }

    // 境界チェック
    if (newCropArea.x < 0) {
      newCropArea.width += newCropArea.x;
      newCropArea.height = newCropArea.width / aspectRatio;
      newCropArea.x = 0;
    }
    if (newCropArea.y < 0) {
      newCropArea.height += newCropArea.y;
      newCropArea.width = newCropArea.height * aspectRatio;
      newCropArea.y = 0;
    }
    if (newCropArea.x + newCropArea.width > imageSize.width) {
      newCropArea.width = imageSize.width - newCropArea.x;
      newCropArea.height = newCropArea.width / aspectRatio;
    }
    if (newCropArea.y + newCropArea.height > imageSize.height) {
      newCropArea.height = imageSize.height - newCropArea.y;
      newCropArea.width = newCropArea.height * aspectRatio;
    }

    setCropArea(newCropArea);
  };

  // ドラッグ・リサイズ終了
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
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

  // マウス・タッチイベントリスナーの設定
  useEffect(() => {
    if (isDragging || isResizing) {
      // マウスイベント
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // タッチイベント
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    cropArea,
    initialCropArea,
    imageSize,
    resizeHandle,
  ]);

  // リサイズハンドルのレンダリング
  const renderResizeHandles = () => {
    const handles: ResizeHandle[] = [
      { position: 'nw', cursor: 'nw-resize' },
      { position: 'ne', cursor: 'ne-resize' },
      { position: 'sw', cursor: 'sw-resize' },
      { position: 'se', cursor: 'se-resize' },
    ];

    return handles.map((handle) => {
      const getHandleStyle = () => {
        const base = {
          position: 'absolute' as const,
          width: '14px',
          height: '14px',
          backgroundColor: 'var(--color-primary)',
          border: '3px solid white',
          borderRadius: '50%',
          cursor: handle.cursor,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
        };

        switch (handle.position) {
          case 'nw':
            return { ...base, top: '-7px', left: '-7px' };
          case 'ne':
            return { ...base, top: '-7px', right: '-7px' };
          case 'sw':
            return { ...base, bottom: '-7px', left: '-7px' };
          case 'se':
            return { ...base, bottom: '-7px', right: '-7px' };
          default:
            return base;
        }
      };

      return (
        <div
          key={handle.position}
          style={getHandleStyle()}
          onMouseDown={(e) =>
            handleResizeStart(e as MouseEvent, handle.position)
          }
          onTouchStart={(e) =>
            handleResizeTouchStart(e as TouchEvent, handle.position)
          }
          className='hover:scale-110 active:scale-95'
          title={`サイズ変更: ${handle.position.toUpperCase()}`}
        />
      );
    });
  };

  return (
    <div className='space-y-4'>
      <div className='bg-background-lighter p-4 rounded-lg border border-border'>
        <div className='mb-4 p-3 bg-background-light border border-border rounded-lg'>
          <p className='text-primary text-sm font-medium mb-2'>
            📷 画像トリミングガイド
          </p>
          <ul className='text-foreground text-xs space-y-1'>
            <li>・ 枠全体をドラッグして位置を移動</li>
            <li>・ 四隅のハンドルをドラッグしてサイズ変更</li>
            <li>・ 4:5の比率が保持されます</li>
          </ul>
        </div>

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
              onTouchStart={handleTouchStart}
            >
              <div className='absolute inset-0 border border-white border-dashed' />

              {/* リサイズハンドル */}
              {renderResizeHandles()}
            </div>
          </div>
        </div>

        <div className='flex gap-3 justify-center'>
          <button
            type='button'
            onClick={handleCrop}
            className='bg-primary hover:bg-primary-dark text-primary-foreground font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2'
          >
            <span className='text-lg'>✂️</span>
            <span>トリミング実行</span>
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='bg-background-light border border-border text-foreground hover:bg-background-lighter hover:border-primary font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2'
          >
            <span className='text-lg'>❌</span>
            <span>キャンセル</span>
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
}
