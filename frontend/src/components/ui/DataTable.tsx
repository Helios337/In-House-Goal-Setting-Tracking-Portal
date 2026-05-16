import * as React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-3.5 whitespace-nowrap">
                    {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
