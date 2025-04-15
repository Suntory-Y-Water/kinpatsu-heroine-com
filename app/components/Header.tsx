export function Header() {
  // 本来はuseStateでメニューの開閉状態を管理するが、レイアウト確認のため固定表示
  const isMenuOpen = false;

  return (
    <header className='bg-[#1A1F2C] py-4 border-b border-yellow-900/30'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center'>
          <a href='/' className='flex items-center gap-2'>
            <span className='text-[#F3DB5F] text-xl font-bold'>
              金髪ヒロイン.com
            </span>
          </a>

          {/* モバイルメニュー */}
          <button
            type='button'
            className='md:hidden text-[#F3DB5F]'
            aria-label='メニュー'
          >
            メニュー
          </button>

          {/* デスクトップメニュー */}
          <div
            className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto bg-[#1A1F2C] md:bg-transparent p-4 md:p-0 z-50 md:z-auto items-center gap-4 border-b md:border-b-0 border-yellow-900/30 md:border-transparent`}
          >
            <div className='relative w-full md:w-auto'>
              {/* 検索フォーム */}
              <form className='flex'>
                <input
                  type='text'
                  placeholder='キャラクター名を検索...'
                  className='bg-[#232836] rounded-l px-4 py-2 w-full md:w-64 text-[#FFFDE7] border-r-0 border border-yellow-900/30 focus:outline-none focus:ring-1 focus:ring-[#F3DB5F]'
                />
                <button
                  type='submit'
                  className='bg-[#F3DB5F] text-[#1A1F2C] rounded-r px-4 py-2 font-medium hover:bg-[#E5CD50] transition-colors'
                >
                  検索
                </button>
              </form>
            </div>

            <a
              href='/register/work'
              className='bg-[#F3DB5F] text-[#1A1F2C] rounded px-4 py-2 font-medium hover:bg-[#E5CD50] transition-colors w-full md:w-auto text-center'
            >
              登録する
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
