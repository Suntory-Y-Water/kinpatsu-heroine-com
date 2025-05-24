export function Header() {
  return (
    <header className='bg-gray-800 py-6 border-b border-yellow-400 shadow-xl sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-start'>
          <a
            href='/'
            className='group transition-all duration-300 hover:scale-105'
          >
            <span className='text-2xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:to-yellow-500 transition-all duration-300'>
              金髪ヒロイン.com
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
