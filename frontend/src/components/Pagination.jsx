import { memo } from 'react';
import '../styles/pagination.css';

export const Pagination = memo(({ total, current, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        ← Anterior
      </button>

      <div className="pagination-pages">
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={idx} className="pagination-dots">...</span>
          ) : (
            <button
              key={page}
              className={`pagination-page ${current === page ? 'active' : ''}`}
              onClick={() => onChange(page)}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        className="pagination-btn"
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
      >
        Próxima →
      </button>

      <span className="pagination-info">
        Página {current} de {totalPages}
      </span>
    </div>
  );
});

export default Pagination;
