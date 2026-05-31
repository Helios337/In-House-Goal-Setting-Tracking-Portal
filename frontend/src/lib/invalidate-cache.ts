"use client";

import { mutate } from "swr";

/** Revalidate all goal, check-in, and report SWR caches after a mutation. */
export async function invalidateGoalsCache() {
  await mutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith("/goals/") ||
        key.startsWith("/checkins/") ||
        key.startsWith("/reports/dashboard") ||
        key.startsWith("/shared-goals/"))
  );
}
