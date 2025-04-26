interface CharacterCardProps {
  characterId: number;
  characterName: string;
  imageUrl: string;
  workName: string;
  likes: number;
}

export function CharacterCard({
  characterId,
  characterName,
  imageUrl,
  workName,
  likes,
}: CharacterCardProps) {
  return (
    <a
      href={`/character/${characterId}`}
      className='group relative overflow-hidden rounded-lg bg-gradient-to-b from-gray-900 to-black border border-yellow-900/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
    >
      <div className='aspect-square relative overflow-hidden'>
        <img
          src={imageUrl}
          alt={characterName}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
      </div>
      <div className='absolute bottom-0 w-full p-4'>
        <h3 className='text-yellow-300 text-lg font-bold mb-1 truncate'>
          {characterName}
        </h3>
        <p className='text-yellow-50/50 text-sm truncate'>{workName}</p>
      </div>
      <div className='absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-3 py-1'>
        <span className='text-yellow-300 text-sm'>♥</span>
        <span className='text-white text-sm'>{likes}</span>
      </div>
    </a>
  );
}
