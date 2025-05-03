export function Header() {
  return (
    <header className='bg-gray-900 py-4 border-b border-yellow-900/30'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center'>
          <a href='/' className='flex items-center gap-2'>
            <span className='text-yellow-300 text-xl font-bold'>
              金髪ヒロイン.com
            </span>
          </a>
          <div>
            <a
              href='/register/work'
              className='bg-yellow-300 text-gray-900 rounded px-3 md:px-4 py-2 font-medium hover:bg-yellow-500 transition-colors text-sm md:text-base'
            >
              ヒロインを登録する
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
