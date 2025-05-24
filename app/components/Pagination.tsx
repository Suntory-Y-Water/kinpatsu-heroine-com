type PaginationProps = {
  currentPage: number;
  totalPages: number;
  sortOrder?: string;
  defaultSortOrder?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  sortOrder,
  defaultSortOrder,
}: PaginationProps) {
  // ページングURLを生成するヘルパー関数
  function buildPageUrl(page: number): string {
    const params = new URLSearchParams();
    if (sortOrder && sortOrder !== defaultSortOrder) {
      params.set('sort', sortOrder);
    }
    if (page > 1) {
      params.set('page', String(page));
    }
    return `/?${params.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-center space-x-8 py-12'>
      {currentPage > 1 ? (
        <a
          href={buildPageUrl(currentPage - 1)}
          className='group inline-flex items-center gap-2 px-6 py-3 bg-gray-700 border border-gray-600 rounded-full text-white hover:bg-gray-600 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
        >
          <span className='text-yellow-300 group-hover:text-yellow-400 transition-colors duration-300'>
            ←
          </span>
        </a>
      ) : (
        <div className='inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-gray-500 pointer-events-none opacity-50'>
          <span>←</span>
        </div>
      )}

      <div className='bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 font-bold text-lg px-6 py-3 rounded-full shadow-lg min-w-[120px] text-center'>
        {currentPage} / {totalPages}
      </div>

      {currentPage < totalPages ? (
        <a
          href={buildPageUrl(currentPage + 1)}
          className='group inline-flex items-center gap-2 px-6 py-3 bg-gray-700 border border-gray-600 rounded-full text-white hover:bg-gray-600 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
        >
          <span className='text-yellow-300 group-hover:text-yellow-400 transition-colors duration-300'>
            →
          </span>
        </a>
      ) : (
        <div className='inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-gray-500 pointer-events-none opacity-50'>
          <span>→</span>
        </div>
      )}
    </div>
  );
}
