import { useState } from 'hono/jsx';

interface LikeButtonProps {
  initialLikes: number;
  characterId: number;
  isLiked: boolean;
}

export default function LikeButton({
  initialLikes,
  characterId,
  isLiked: initialIsLiked = false,
}: LikeButtonProps) {
  const [displayLikes, setDisplayLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLike(e: MouseEvent) {
    e.preventDefault();

    if (!isLiked && !isLoading) {
      setIsLoading(true);

      try {
        const response = await fetch('/character/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId }),
        });

        // 成功の場合
        if (response.ok) {
          const data = await response.json<{
            success: boolean;
            likes: number;
            message: string;
          }>();

          setIsLiked(true);
          setDisplayLikes(data.likes);
          return;
        }

        // 既にいいね済みの場合
        if (response.status === 409) {
          setIsLiked(true);
          return;
        }
      } catch (_err) {
        console.error(_err);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <button
      type='button'
      onClick={handleLike}
      disabled={isLiked || isLoading}
      className={`flex items-center gap-2 hover:cursor-pointer bg-black/40 rounded-full px-4 py-2 border border-yellow-900/30 transition-colors duration-200 group ${
        isLiked ? 'bg-pink-900/30' : 'hover:bg-pink-800/70'
      } ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isLiked ? 'いいね済み' : 'いいねする'}
    >
      <span
        className={`transition-colors ${
          isLiked
            ? 'text-pink-400'
            : 'text-yellow-300 group-hover:text-pink-400'
        }`}
      >
        ♥
      </span>
      <span className='text-white'>{displayLikes}</span>
    </button>
  );
}
