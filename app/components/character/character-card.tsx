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
      className='group block relative overflow-hidden rounded-lg bg-gray-800 border border-gray-600 transition-all duration-300 hover:border-yellow-400 hover:shadow-lg hover:-translate-y-1'
    >
      <div className='aspect-square relative overflow-hidden'>
        <img
          src={imageUrl}
          alt={characterName}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
        />

        <div className='absolute top-2 right-2 bg-black/80 rounded-full px-3 py-1 flex items-center gap-1'>
          <span className='text-yellow-400 text-sm'>♥</span>
          <span className='text-white text-sm'>{likes}</span>
        </div>

        <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent' />
      </div>

      <div className='absolute bottom-0 left-0 right-0 p-3 text-white'>
        <h3 className='font-bold text-yellow-300 truncate mb-1'>
          {characterName}
        </h3>
        <p className='text-sm text-gray-300 truncate'>{workName}</p>
      </div>
    </a>
  );
}
