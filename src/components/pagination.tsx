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
    transition-all duration-300 ease-in-out transform
    ${isFirstPage 
      ? 'cursor-not-allowed opacity-50' 
      : 'hover:scale-105 hover:-translate-y-0.5 active:scale-95'
    }
  `}
  style={{
    background: "rgba(50, 50, 50, 0.4)", // glass dark gray
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.15)", // subtle frosted border
    color: isFirstPage ? "rgba(255,255,255,0.5)" : "#fff",
    boxShadow: isFirstPage
      ? "none"
      : "0 4px 15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
  }}
>
  <ChevronLeft className="w-4 h-4" />
  <span className="hidden sm:inline">Previous</span>

  {!isFirstPage && (
    <div
      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
      }}
    />
  )}
</button>

       {/* Page Numbers */}
<div className="flex items-center space-x-1">
  {pageNumbers.map((page, index) => (
    <React.Fragment key={index}>
      {page === "..." ? (
        <div className="flex items-center justify-center w-10 h-10">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </div>
      ) : (
        <button
          onClick={() => handlePageChange(page as number)}
          className={`
            group relative flex items-center justify-center w-12 h-12 rounded-xl font-semibold text-sm
            transition-all duration-300 ease-in-out transform
            ${currentPage === page 
              ? "scale-110 hover:-translate-y-1 z-10" 
              : "hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            }
          `}
          style={{
            background:
              currentPage === page
                ? `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`
                : "rgba(50, 50, 50, 0.4)", // glass dark gray
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: currentPage === page ? "#fff" : "rgba(255,255,255,0.8)",
            border:
              currentPage === page
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              currentPage === page
                ? "0 8px 25px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255,255,255,0.15)"
                : "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          {page}
          {currentPage === page && (
            <div
              className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
              }}
            />
          )}
          {currentPage !== page && (
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
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
    background: "rgba(50, 50, 50, 0.4)", // glass dark gray
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.15)", // subtle frosted border
    color: isFirstPage ? "rgba(255,255,255,0.5)" : "#fff",
    boxShadow: isFirstPage
      ? "none"
      : "0 4px 15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
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


  <div
  className="hidden md:flex items-center ml-6 px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
  style={{
    background: "rgba(255, 255, 255, 0.08)", 
    border: `1px solid ${colors.primary.hex}30`, 
  }}
>
  <span
    className="text-sm font-medium"
    style={{
      color: "#ffffff", 
    }}
  >
    Page {currentPage} of {totalPages}
  </span>
</div>


    </nav>
  );
};

export default Pagination;