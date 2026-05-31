"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export interface ExportRow {
  email: string;
  goal: string;
  quarter: string;
  progress: number;
}

interface ExportButtonProps {
  data: ExportRow[];
  filename?: string;
}

export function ExportButton({ data, filename = "Achievement_Report.csv" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
      }

      const headers = Object.keys(data[0]) as (keyof ExportRow)[];
      const csvRows: string[] = [];
      csvRows.push(headers.join(","));

      for (const row of data) {
        const values = headers.map((header) => {
          const val = row[header] ?? "";
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      isLoading={isExporting}
      className="gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </Button>
  );
}
