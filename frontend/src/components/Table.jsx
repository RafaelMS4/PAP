import { memo } from 'react';
import '../styles/tables.css';

export const Table = memo(({ 
  columns, 
  rows, 
  loading = false,
  onRowClick,
  actions
}) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner-small"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="table-empty">
        <p>Nenhum dado encontrado</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={`col-${col.key}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="col-actions">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx} onClick={() => onRowClick?.(row)} className="clickable">
              {columns.map(col => (
                <td key={col.key} className={`col-${col.key}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="action-buttons">
                    {actions.map(action => (
                      <button
                        key={action.id}
                        className={`action-btn action-${action.id}`}
                        onClick={() => action.onClick?.(row)}
                        title={action.label}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default Table;
