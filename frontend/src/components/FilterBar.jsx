import { memo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/filters.css';

export const FilterBar = memo(({ 
  filters, 
  onFilterChange, 
  onFiltersChange, 
  onSearch, 
  searchPlaceholder = 'Pesquisar...',
  loading = false 
}) => {
  const handleFilterChange = onFilterChange || onFiltersChange;

  return (
    <div className="filter-bar">
      <div className="search-box">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="search-input"
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <span className="search-icon"><SearchIcon sx={{ fontSize: '1.2rem' }} /></span>
      </div>

      <div className="filters-container">
        {filters.map((filter) => {
          const filterKey = filter.key ?? filter.name;
          return (
            <select
              key={filterKey}
              className="filter-select"
              value={filter.value || ''}
              onChange={(e) => handleFilterChange?.(filterKey, e.target.value)}
              disabled={loading}
            >
              <option value="">{filter.label}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        })}
      </div>
    </div>
  );
});

export default FilterBar;
