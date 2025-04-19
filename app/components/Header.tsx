export function Header() {
  return (
    <header className='bg-[#1A1F2C] py-4 border-b border-yellow-900/30'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center'>
          <a href='/' className='flex items-center gap-2'>
            <span className='text-[#F3DB5F] text-xl font-bold'>
              金髪ヒロイン.com
            </span>
          </a>
          <div
            className={
              'flex md:flex flex-col md:flex-row absolute md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto bg-[#1A1F2C] md:bg-transparent p-4 md:p-0 z-50 md:z-auto items-center gap-4 border-b md:border-b-0 border-yellow-900/30 md:border-transparent'
            }
          >
            <a
              href='/register/work'
              className='bg-[#F3DB5F] text-[#1A1F2C] rounded px-4 py-2 font-medium hover:bg-[#E5CD50] transition-colors w-full md:w-auto text-center'
            >
              新しいヒロインを登録する
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
