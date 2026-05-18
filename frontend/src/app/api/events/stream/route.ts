import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const backendResponse = await fetch(`${apiUrl}/api/v1/events/stream`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
  });

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response("Failed to connect to event stream", {
      status: backendResponse.status,
    });
  }

  return new Response(backendResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
