"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { Input, Label, Select } from "@/components/smm/ui/Input";
import { createProviderAction } from "@/lib/smm/actions/admin-providers";

export function CreateProviderDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"MOCK" | "GENERIC">("MOCK");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createProviderAction(formData);
      if (res.ok) {
        toast.success("تم إضافة المزود");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          إضافة مزود
        </Button>
      </DialogTrigger>
      <DialogContent title="إضافة مزود خدمات جديد">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المزود</Label>
            <Input id="name" name="name" required placeholder="مثال: المزود الرئيسي" />
          </div>
          <div>
            <Label htmlFor="type">النوع</Label>
            <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as "MOCK" | "GENERIC")}>
              <option value="MOCK">تجريبي (Mock)</option>
              <option value="GENERIC">API عام (Generic)</option>
            </Select>
          </div>
          {type === "GENERIC" && (
            <>
              <div>
                <Label htmlFor="apiUrl">رابط API</Label>
                <Input id="apiUrl" name="apiUrl" type="url" placeholder="https://provider.example.com/api/v2" />
              </div>
              <div>
                <Label htmlFor="apiKey">مفتاح API</Label>
                <Input id="apiKey" name="apiKey" type="password" placeholder="سيُشفَّر قبل التخزين" />
              </div>
            </>
          )}
          <Button type="submit" className="w-full" loading={pending}>
            إضافة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
