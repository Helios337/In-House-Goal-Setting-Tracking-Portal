import * as React from "react";
import { Select } from "@/components/ui/Select";

export type UoMType = "Min (Numeric / %)" | "Max (Numeric / %)" | "Timeline" | "Zero";

interface UoMSelectorProps {
  value: UoMType | "";
  onChange: (value: UoMType) => void;
  error?: string;
}

export function UoMSelector({ value, onChange, error }: UoMSelectorProps) {
  const options = [
    { label: "Min (Higher is better - e.g., Sales)", value: "Min (Numeric / %)" },
    { label: "Max (Lower is better - e.g., Cost)", value: "Max (Numeric / %)" },
    { label: "Timeline (Date-based completion)", value: "Timeline" },
    { label: "Zero (Zero = Success - e.g., Safety)", value: "Zero" },
  ];

  return (
    <Select
      label="Unit of Measurement (UoM)"
      value={value}
      onChange={(e) => onChange(e.target.value as UoMType)}
      options={options}
      placeholder="Select Measurement Type"
      error={error}
    />
  );
}
