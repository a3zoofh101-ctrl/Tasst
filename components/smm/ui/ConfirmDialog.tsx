"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "primary",
  onConfirm
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description}>
        <div className="flex items-center justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={variant}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm();
                setOpen(false);
              } finally {
                setLoading(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
