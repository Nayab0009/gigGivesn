type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + Math.max(currentPage - 1, 1)
  );

  return (
    <div className="flex items-center">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg [background:var(--container-bg)] text-text-main px-3.5 py-2.5 border border-gray-300 shadow-theme-xs hover:opacity-90 transition disabled:opacity-50 dark:border-gray-700 text-sm"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}

        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded flex w-10 h-10 items-center justify-center text-sm font-medium transition
              ${
                currentPage === page
                  ? "bg-brand-500 text-white"
                  : "text-text-main hover:[color:var(--brand-color)] hover:bg-blue-500/[0.08]"
              }`}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center h-10 justify-center rounded-lg [background:var(--container-bg)] text-text-main px-3.5 py-2.5 border border-gray-300 shadow-theme-xs hover:opacity-90 transition disabled:opacity-50 dark:border-gray-700 text-sm"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
