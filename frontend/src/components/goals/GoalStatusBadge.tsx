import * as React from "react";
import { Badge } from "@/components/ui/Badge";

export type GoalStatus = "Not Started" | "On Track" | "Completed";

interface GoalStatusBadgeProps {
  status: GoalStatus;
  className?: string;
}

export function GoalStatusBadge({ status, className }: GoalStatusBadgeProps) {
  const variantMap: Record<GoalStatus, "default" | "warning" | "success"> = {
    "Not Started": "default",
    "On Track": "warning",
    "Completed": "success",
  };

  return (
    <Badge variant={variantMap[status]} className={className}>
      {status}
    </Badge>
  );
}
