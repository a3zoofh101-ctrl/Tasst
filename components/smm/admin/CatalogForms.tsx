"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/smm/ui/Button";
import { Input, Select } from "@/components/smm/ui/Input";
import { Badge } from "@/components/smm/ui/Badge";
import {
  createPlatformAction,
  createCategoryAction,
  togglePlatformActiveAction,
  toggleCategoryActiveAction
} from "@/lib/smm/actions/admin-catalog";

export function CreatePlatformForm() {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("name", name);
        startTransition(async () => {
          const res = await createPlatformAction(formData);
          if (res.ok) {
            toast.success("تمت إضافة المنصة");
            setName("");
          } else toast.error(res.error);
        });
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم منصة جديدة (مثال: Instagram)" required />
      <Button type="submit" loading={pending} size="sm">
        <Plus className="size-4" /> إضافة
      </Button>
    </form>
  );
}

export function CreateCategoryForm({ platforms }: { platforms: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("name", name);
        formData.set("platformId", platformId);
        startTransition(async () => {
          const res = await createCategoryAction(formData);
          if (res.ok) {
            toast.success("تمت إضافة التصنيف");
            setName("");
          } else toast.error(res.error);
        });
      }}
    >
      <Select value={platformId} onChange={(e) => setPlatformId(e.target.value)} className="w-40">
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم التصنيف (مثال: متابعون)" required />
      <Button type="submit" loading={pending} size="sm">
        <Plus className="size-4" /> إضافة
      </Button>
    </form>
  );
}

export function ToggleChip({ id, active, kind }: { id: string; active: boolean; kind: "platform" | "category" }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = kind === "platform" ? await togglePlatformActiveAction(id) : await toggleCategoryActiveAction(id);
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      <Badge tone={active ? "success" : "danger"}>{active ? "مفعّل" : "معطّل"}</Badge>
    </button>
  );
}
