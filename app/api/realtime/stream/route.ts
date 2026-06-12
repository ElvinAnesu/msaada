import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected" });

      const supabase = createAdminClient();
      const channel = supabase
        .channel(`realtime-${auth.user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tickets" },
          (payload) => {
            send({
              table: "tickets",
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "ticket_messages" },
          (payload) => {
            send({
              table: "ticket_messages",
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
            });
          }
        )
        .subscribe();

      const heartbeat = setInterval(() => send({ type: "ping" }), 25000);

      const cleanup = () => {
        clearInterval(heartbeat);
        supabase.removeChannel(channel);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
