'use client';

export default function DataTable({ columns, rows, keyExtractor = (row) => row.id, onEdit, onDelete, emptyMessage = 'No data' }) {
  if (!rows?.length) {
    return (
      <div className="rounded-lg border border-admin-border bg-admin-card p-8 text-center text-admin-muted">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-admin-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-admin-card border-b border-admin-border text-admin-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 font-medium w-28">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-admin-card/50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-200">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="text-admin-accent hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
