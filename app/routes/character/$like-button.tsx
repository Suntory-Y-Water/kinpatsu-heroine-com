import { useState } from 'hono/jsx';

interface LikeButtonProps {
  initialLikes: number;
  characterId: string;
}

export default function LikeButton({
  initialLikes,
  characterId,
}: LikeButtonProps) {
  const [displayLikes, setDisplayLikes] = useState(initialLikes);

  const handleLike = async (e: MouseEvent) => {
    // Prevent potential event bubbling if wrapped in other elements
    e.stopPropagation();

    // Always increment likes on click
    setDisplayLikes((prev) => prev + 1);

    // TODO: Implement actual API call to backend for saving the like
    // This TODO now represents incrementing the count on the backend
    // console.log(`Incrementing like for character ${characterId}... Current display: ${displayLikes + 1}`);
    // try {
    //   const response = await fetch('/api/like/increment', { // Example: different endpoint or payload
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ characterId }),
    //   });
    //   if (!response.ok) {
    //     // Revert state on error (optional, or show error message)
    //     setDisplayLikes((prev) => prev - 1);
    //     console.error('Failed to increment like count');
    //   }
    // } catch (error) {
    //   setDisplayLikes((prev) => prev - 1);
    //   console.error('Error incrementing like:', error);
    // }
  };

  return (
    <button
      type='button'
      onClick={handleLike}
      className='flex items-center gap-2 hover:cursor-pointer bg-black/40 rounded-full px-4 py-2 border border-yellow-900/30 transition-colors duration-200 group hover:bg-pink-800/70'
      aria-label='いいねする'
    >
      <span className='transition-colors text-[#F3DB5F] group-hover:text-pink-400'>
        ♥
      </span>
      <span className='text-[#FFFDE7]'>{displayLikes}</span>
    </button>
  );
}
