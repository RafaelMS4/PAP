import { memo } from 'react';
import '../styles/filters.css';

export const FilterBar = memo(({ 
  filters, 
  onFilterChange, 
  onSearch, 
  searchPlaceholder = 'Pesquisar...',
  loading = false 
}) => {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="search-input"
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="filters-container">
        {filters.map((filter) => (
          <select
            key={filter.key}
            className="filter-select"
            value={filter.value || ''}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            disabled={loading}
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
});

export default FilterBar;
