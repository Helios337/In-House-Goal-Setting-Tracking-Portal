import { z } from "zod";

// Validates a single goal row
export const goalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Goal title is required"),
  description: z.string().optional(),
  thrustAreaId: z.number().int().positive("Thrust Area is required"),
  uom: z.enum(["Min (Numeric / %)", "Max (Numeric / %)", "Timeline", "Zero"]),
  target: z.string().min(1, "Target is required"),
  // Rule: Minimum weightage per individual goal: 10%
  weightage: z.number().min(10, "Minimum weightage per goal is 10%").max(100),
  isShared: z.boolean().default(false),
});

// Validates the entire goal sheet submission
export const goalSheetSchema = z.array(goalSchema)
  // Rule: Maximum number of goals per employee: 8
  .max(8, "You cannot exceed a maximum of 8 goals.")
  .refine(
    (goals) => {
      const totalWeightage = goals.reduce((sum, goal) => sum + (goal.weightage || 0), 0);
      // Rule: Total weightage across all goals must equal 100%
      return totalWeightage === 100;
    },
    {
      message: "Total weightage across all goals must equal exactly 100%",
    }
  );

export type GoalFormValues = z.infer<typeof goalSchema>;

const uomEnum = z.enum(["Min (Numeric / %)", "Max (Numeric / %)", "Timeline", "Zero"]);

/** Validates the standalone GoalForm component (string thrust area field). */
export const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thrustArea: z.string().min(1, "Thrust Area is required"),
  uom: uomEnum.or(z.literal("")).refine((v) => v !== "", { message: "UoM is required" }),
  target: z.string().min(1, "Target is required"),
  weightage: z.number().min(10, "Minimum weightage is 10%").max(100),
});
