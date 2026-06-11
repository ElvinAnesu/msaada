"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TicketMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TicketChatPanelProps {
  ticketId: string;
  currentUserId: string;
  canSend?: boolean;
}

export function TicketChatPanel({
  ticketId,
  currentUserId,
  canSend = true,
}: TicketChatPanelProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch {
      // silent poll failure
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !canSend) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }
      setText("");
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex h-[min(520px,70vh)] flex-col lg:sticky lg:top-6">
      <CardHeader className="shrink-0 border-b border-slate-100 pb-3">
        <CardTitle className="text-base">Messages</CardTitle>
      </CardHeader>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {loading && messages.length === 0 && (
          <p className="text-center text-sm text-slate-400">Loading messages...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-slate-400">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const isReminder = msg.message.startsWith("🔔");
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  isReminder
                    ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                    : isOwn
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-800"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isReminder
                      ? "text-amber-700"
                      : isOwn
                        ? "text-primary-light"
                        : "text-slate-500"
                  )}
                >
                  {msg.sender?.full_name || "User"} · {formatDate(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {canSend ? (
        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-slate-100 p-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" size="sm" loading={sending} disabled={!text.trim()}>
              Send
            </Button>
          </div>
        </form>
      ) : (
        <p className="shrink-0 border-t border-slate-100 p-3 text-center text-xs text-slate-400">
          Messaging unavailable
        </p>
      )}
    </Card>
  );
}
