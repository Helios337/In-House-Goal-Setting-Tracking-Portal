import type { z } from "zod";
import { api } from "@/lib/api";
import { parseApi } from "@/lib/parse-api";

/** Build a typed SWR fetcher that validates responses with Zod at the API boundary. */
export function createValidatedFetcher<T>(schema: z.ZodType<T>, context: string) {
  return async (url: string): Promise<T> => {
    const { data } = await api.get(url);
    return parseApi(schema, data, context);
  };
}
