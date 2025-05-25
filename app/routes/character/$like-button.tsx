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
      className={`flex items-center gap-3 bg-background-light hover:bg-background-lighter border border-border hover:border-accent rounded-lg px-6 py-3 transition-all duration-300 transform hover:scale-105 group ${
        isLiked ? 'bg-background-lighter border-accent' : ''
      } ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isLiked ? 'いいね済み' : 'いいねする'}
    >
      <span
        className={`text-2xl transition-colors duration-300 ${
          isLiked
            ? 'text-accent'
            : 'text-foreground-muted group-hover:text-accent'
        }`}
      >
        ♥
      </span>
      <span className='text-foreground group-hover:text-accent font-bold text-lg transition-colors duration-300'>
        {displayLikes}
      </span>
    </button>
  );
}
