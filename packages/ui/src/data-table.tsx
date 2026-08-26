import * as React from "react";
import clsx from "clsx";
import { Card, CardContent } from "./card";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, isLoading, emptyMessage = "Nothing here yet." }: DataTableProps<T>) {
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-5 py-2 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx("border-b border-slate-50 last:border-0", onRowClick && "cursor-pointer hover:bg-slate-50")}
              >
                {columns.map((col) => (
                  <td key={col.header} className="px-5 py-3">
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : null}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
