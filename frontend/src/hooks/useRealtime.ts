"use client";

import { useEffect, useRef } from "react";
import { mutate } from "swr";
import { domainEventSchema, type DomainEventMessage } from "@/lib/api-schemas";
import { parseApi } from "@/lib/parse-api";
import { useToast } from "@/providers/RealtimeProvider";

const EVENT_MUTATE_MAP: Record<string, string[]> = {
  "goal.sheet.submitted": [
    "/goals/manager/pending-approvals",
    "/goals/sheets",
    "/goals/sheets/current",
    "/team-goals",
  ],
  "goal.sheet.approved": [
    "/goals/sheets/current",
    "/goals/sheets",
    "/checkins/team",
  ],
  "goal.updated": ["/goals/sheets/current", "/goals/sheets"],
  "shared_kpi.pushed": ["/goals/sheets/current", "/shared-goals/cascade-options"],
  "shared_kpi.synced": ["/goals/sheets/current", "/shared-goals/cascade-options"],
  "checkin.created": ["/checkins/team", "/goals/sheets/current"],
  "achievement.updated": ["/goals/sheets/current", "/achievements"],
  "notification.created": ["/notifications"],
  "escalation.created": ["/notifications"],
};

function invalidateForEvent(event: DomainEventMessage) {
  const keys = EVENT_MUTATE_MAP[event.type] ?? [];
  keys.forEach((key) => {
    mutate((cacheKey) => typeof cacheKey === "string" && cacheKey.startsWith(key));
  });
}

export function useRealtime(enabled: boolean = true) {
  const { showToast } = useToast();
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const source = new EventSource("/api/events/stream");
    sourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const raw: unknown = JSON.parse(event.data);
        const data = parseApi(domainEventSchema, raw, "domain event");
        if (data.type === "heartbeat" || data.type === "connected") return;

        invalidateForEvent(data);

        if (data.type === "notification.created") {
          const title = (data.payload?.title as string) || "New notification";
          showToast(title, "info");
        } else if (data.type === "goal.sheet.submitted") {
          showToast("A team member submitted goals for approval", "info");
        } else if (data.type === "goal.sheet.approved") {
          showToast("Your goal sheet was approved", "success");
        } else if (
          data.type === "shared_kpi.pushed" ||
          data.type === "shared_kpi.synced"
        ) {
          showToast("Shared goals updated", "info");
        }
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [enabled, showToast]);
}

export type { DomainEventMessage };
