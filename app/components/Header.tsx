export function Header() {
  return (
    <header className='bg-background py-6 border-b border-primary shadow-xl sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-start'>
          <a href='/' className='group'>
            <span className='text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent group-hover:from-primary-light group-hover:to-primary'>
              金髪ヒロイン.com
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
