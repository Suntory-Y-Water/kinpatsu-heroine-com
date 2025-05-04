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
    <div className='flex items-center justify-center space-x-6 py-8'>
      {currentPage > 1 ? (
        <a
          href={buildPageUrl(currentPage - 1)}
          className='inline-flex items-center gap-1 px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-700 hover:text-yellow-300 transition-colors'
        >
          <span>←</span>
          <span className='sr-only'>Previous</span>
        </a>
      ) : (
        <div className='inline-flex items-center gap-1 px-4 py-2 border border-gray-700 rounded-md text-gray-500 pointer-events-none opacity-50'>
          <span>←</span>
          <span className='sr-only'>Previous</span>
        </div>
      )}

      <div className='text-yellow-300 font-mono text-sm'>
        {currentPage} / {totalPages}
      </div>

      {currentPage < totalPages ? (
        <a
          href={buildPageUrl(currentPage + 1)}
          className='inline-flex items-center gap-1 px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-700 hover:text-yellow-300 transition-colors'
        >
          <span className='sr-only'>Next</span>
          <span>→</span>
        </a>
      ) : (
        <div className='inline-flex items-center gap-1 px-4 py-2 border border-gray-700 rounded-md text-gray-500 pointer-events-none opacity-50'>
          <span className='sr-only'>Next</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
}
