export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { header: string; key: keyof T | ((row: T) => any) }[]
) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => {
    return columns
      .map(col => {
        let val = typeof col.key === 'function' ? col.key(row) : row[col.key];
        if (val === null || val === undefined) val = '';
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
