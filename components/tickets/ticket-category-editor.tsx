"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ticket } from "@/lib/types";
import { DEFAULT_TICKET_CATEGORY, TICKET_CATEGORIES } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketCategoryEditorProps {
  ticketId: string;
  currentCategory: string;
  onUpdated: (ticket: Ticket) => void;
}

export function TicketCategoryEditor({
  ticketId,
  currentCategory,
  onUpdated,
}: TicketCategoryEditorProps) {
  const [category, setCategory] = useState(
    currentCategory === DEFAULT_TICKET_CATEGORY ? "" : currentCategory
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_category", category }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update category");
        return;
      }
      toast.success("Category updated");
      onUpdated(json.ticket);
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category</CardTitle>
      </CardHeader>
      <p className="mb-3 text-sm text-slate-600">
        Current:{" "}
        <span className="font-medium text-slate-900">
          {currentCategory === DEFAULT_TICKET_CATEGORY
            ? "Not classified yet"
            : currentCategory}
        </span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label="Set category"
            placeholder="Select category"
            options={TICKET_CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} loading={saving}>
          Save Category
        </Button>
      </div>
    </Card>
  );
}
