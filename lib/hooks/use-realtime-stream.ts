"use client";

import { useEffect, useRef } from "react";

export interface RealtimePayload {
  table?: "tickets" | "ticket_messages";
  eventType?: string;
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
  type?: string;
}

export function useRealtimeStream(onEvent: (payload: RealtimePayload) => void) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const es = new EventSource("/api/realtime/stream");

    es.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as RealtimePayload;
        if (data.type === "ping" || data.type === "connected") return;
        callbackRef.current(data);
      } catch {
        // ignore malformed events
      }
    };

    return () => es.close();
  }, []);
}
