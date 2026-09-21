"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/smm/cn";
import { Button } from "@/components/smm/ui/Button";
import { Textarea } from "@/components/smm/ui/Input";
import { TicketStatusBadge } from "@/components/smm/ui/Badge";
import { ConfirmDialog } from "@/components/smm/ui/ConfirmDialog";
import { replyTicketAction, closeTicketAction } from "@/lib/smm/actions/support";

export type TicketMessageDto = {
  id: string;
  message: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
};

export function TicketThread({
  ticketId,
  subject,
  status,
  messages,
  currentUserIsAdmin
}: {
  ticketId: string;
  subject: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  messages: TicketMessageDto[];
  currentUserIsAdmin: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("ticketId", ticketId);
      formData.set("message", message.trim());
      const res = await replyTicketAction(formData);
      if (res.ok) {
        setMessage("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-fg">{subject}</h1>
        <TicketStatusBadge status={status} />
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.isAdmin ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                m.isAdmin ? "bg-surface2 text-fg" : "bg-brand-600 text-white"
              )}
            >
              <p className="mb-1 text-[11px] font-semibold opacity-80">{m.authorName}</p>
              <p className="whitespace-pre-wrap">{m.message}</p>
              <p className="mt-1 text-[10px] opacity-60">{new Date(m.createdAt).toLocaleString("ar-SA")}</p>
            </div>
          </div>
        ))}
      </div>

      {status !== "CLOSED" ? (
        <div className="space-y-2 rounded-2xl border border-border2 p-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={currentUserIsAdmin ? "اكتب ردك على العميل..." : "اكتب رسالتك..."}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" type="button">
                  إغلاق التذكرة
                </Button>
              }
              title="إغلاق التذكرة"
              description="لن تتمكن من إضافة ردود جديدة بعد الإغلاق."
              confirmLabel="إغلاق"
              variant="danger"
              onConfirm={async () => {
                const res = await closeTicketAction(ticketId);
                if (!res.ok) toast.error(res.error);
                router.refresh();
              }}
            />
            <Button size="sm" loading={pending} onClick={submit} disabled={!message.trim()}>
              إرسال
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-surface2 px-4 py-3 text-center text-sm text-muted">هذه التذكرة مغلقة</p>
      )}
    </div>
  );
}
