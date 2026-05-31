"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { goalFormSchema } from "@/lib/validators";
import { UoMSelector, UoMType } from "./UoMSelector";

export interface GoalFormData {
  title: string;
  description: string;
  thrustArea: string;
  uom: UoMType | "";
  target: string;
  weightage: number;
}

interface GoalFormProps {
  initialData?: Partial<GoalFormData>;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isSharedGoal?: boolean;
}

export function GoalForm({ initialData, onSubmit, onCancel, isSharedGoal }: GoalFormProps) {
  const [formData, setFormData] = React.useState<GoalFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    thrustArea: initialData?.thrustArea || "",
    uom: initialData?.uom || "",
    target: initialData?.target || "",
    weightage: initialData?.weightage || 10,
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof GoalFormData, string>>>({});

  const validate = () => {
    const result = goalFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof GoalFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof GoalFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-lg border shadow-sm">
      <Input
        label="Goal Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        disabled={isSharedGoal}
        error={errors.title}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Thrust Area"
          value={formData.thrustArea}
          onChange={(e) => setFormData({ ...formData, thrustArea: e.target.value })}
          disabled={isSharedGoal}
          error={errors.thrustArea}
        />
        <UoMSelector
          value={formData.uom}
          onChange={(uom) => setFormData({ ...formData, uom })}
          error={errors.uom}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={formData.uom === "Timeline" ? "Target Date" : "Target Value"}
          type={formData.uom === "Timeline" ? "date" : "text"}
          value={formData.target}
          onChange={(e) => setFormData({ ...formData, target: e.target.value })}
          disabled={isSharedGoal}
          error={errors.target}
        />
        <Input
          label="Weightage (%)"
          type="number"
          min={10}
          max={100}
          value={formData.weightage}
          onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
          error={errors.weightage}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save Goal
        </Button>
      </div>
    </form>
  );
}
