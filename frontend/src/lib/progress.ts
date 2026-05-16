import { UoMType } from "@/components/goals/UoMSelector";

/**
 * Computes progress score based on the UoM Type formulas provided in the BRD.
 */
export function calculateScore(uom: UoMType | string, target: string | number, actual: string | number): number {
  const t = Number(target);
  const a = Number(actual);

  if (uom !== "Timeline" && (isNaN(t) || isNaN(a))) return 0;

  let rawScore = 0;

  switch (uom) {
    case "Min (Numeric / %)":
      // Higher is better: Achievement ÷ Target
      rawScore = t === 0 ? 0 : (a / t) * 100;
      break;
    case "Max (Numeric / %)":
      // Lower is better: Target ÷ Achievement
      rawScore = a === 0 ? 100 : (t / a) * 100;
      break;
    case "Timeline":
      // Date-based completion vs Deadline
      const tDate = new Date(target).getTime();
      const aDate = new Date(actual).getTime();
      if (isNaN(tDate) || isNaN(aDate)) return 0;
      rawScore = aDate <= tDate ? 100 : 0;
      break;
    case "Zero":
      // Zero = Success
      rawScore = a === 0 ? 100 : 0;
      break;
    default:
      rawScore = 0;
  }

  // Ensure score doesn't fall below 0. 
  // (Note: Some orgs cap at 100%, others allow overachievement. Adjust max cap if needed).
  return Math.max(rawScore, 0);
}
