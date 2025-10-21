import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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
  colors,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
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
            [background:var(--container-bg)] text-text-main
            ${isFirstPage 
              ? "cursor-not-allowed opacity-50" 
              : "hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            }
          `}
          style={{
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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
                  <MoreHorizontal className="w-4 h-4 text-text-main/60" />
                </div>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`
                    group relative flex items-center justify-center w-12 h-12 rounded-xl font-semibold text-sm
                    transition-all duration-300 ease-in-out transform
                    ${
                      currentPage === page
                        ? "scale-110 hover:-translate-y-1 z-10"
                        : "hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                    }
                  `}
                  style={{
                    background:
                      currentPage === page
                        ? `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`
                        : "var(--container-bg)",
                    color:
                      currentPage === page
                        ? "#fff"
                        : "var(--text-main)",
                    border:
                      currentPage === page
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow:
                      currentPage === page
                        ? "0 8px 25px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255,255,255,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  {page}
                  {currentPage === page ? (
                    <div
                      className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                      }}
                    />
                  ) : (
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
            transition-all duration-300 ease-in-out transform
            [background:var(--container-bg)] text-text-main
            ${isLastPage 
              ? "cursor-not-allowed opacity-50" 
              : "hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            }
          `}
          style={{
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: isLastPage
              ? "none"
              : "0 4px 15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />

          {!isLastPage && (
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              }}
            />
          )}
        </button>
      </div>

      {/* Page Info */}
      <div
        className="hidden md:flex items-center ml-6 px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 [background:var(--container-bg)]"
        style={{
          border: `1px solid ${colors.primary.hex}30`,
        }}
      >
        <span className="text-sm font-medium text-text-main">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </nav>
  );
};

export default Pagination;
