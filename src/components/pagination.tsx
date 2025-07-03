import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  colors: {
    primary: { hex: string };
    secondary: { hex: string };
    accent: { hex: string };
    highlight: { hex: string };
    warning: { hex: string };
  };
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  colors 
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center items-center mt-8">
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`
            group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
            transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
            ${isFirstPage 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:-translate-y-0.5 active:scale-95'
            }
          `}
          style={{
            background: isFirstPage 
              ? colors.accent.hex 
              : `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: isFirstPage ? colors.primary.hex : '#fff',
            border: `2px solid ${isFirstPage ? colors.primary.hex : 'transparent'}`,
            boxShadow: isFirstPage 
              ? 'none' 
              : `0 4px 15px rgba(0, 0, 0, 0.1), 0 0 0 1px ${colors.primary.hex}20`,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
          {!isFirstPage && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              }}
            />
          )}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal className="w-4 h-4" style={{ color: colors.primary.hex }} />
                </div>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`
                    group relative flex items-center justify-center w-12 h-12 rounded-xl font-semibold text-sm
                    transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg
                    ${currentPage === page 
                      ? 'hover:-translate-y-1 scale-110 z-10' 
                      : 'hover:-translate-y-0.5 active:scale-95'
                    }
                  `}
                  style={{
                    background: currentPage === page 
                      ? `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})` 
                      : colors.accent.hex,
                    color: currentPage === page ? '#fff' : colors.primary.hex,
                    border: `2px solid ${currentPage === page ? 'transparent' : colors.primary.hex + '30'}`,
                    boxShadow: currentPage === page 
                      ? `0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px ${colors.primary.hex}40, 0 0 20px ${colors.primary.hex}20` 
                      : `0 2px 8px rgba(0, 0, 0, 0.1)`,
                  }}
                >
                  {page}
                  {currentPage === page && (
                    <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                      }}
                    />
                  )}
                  {currentPage !== page && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.hex}15, ${colors.secondary.hex}15)`,
                      }}
                    />
                  )}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`
            group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
            transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
            ${isLastPage 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:-translate-y-0.5 active:scale-95'
            }
          `}
          style={{
            background: isLastPage 
              ? colors.accent.hex 
              : `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: isLastPage ? colors.primary.hex : '#fff',
            border: `2px solid ${isLastPage ? colors.primary.hex : 'transparent'}`,
            boxShadow: isLastPage 
              ? 'none' 
              : `0 4px 15px rgba(0, 0, 0, 0.1), 0 0 0 1px ${colors.primary.hex}20`,
          }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
          {!isLastPage && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              }}
            />
          )}
        </button>
      </div>

      {/* Page Info */}
      <div className="hidden md:flex items-center ml-6 px-4 py-2 rounded-lg"
        style={{
          background: colors.accent.hex,
          border: `1px solid ${colors.primary.hex}30`,
        }}
      >
        <span className="text-sm font-medium"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </nav>
  );
};

export default Pagination;