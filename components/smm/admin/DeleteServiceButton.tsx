"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/smm/ui/Dialog";
import { Button } from "@/components/smm/ui/Button";
import { deleteServiceAction } from "@/lib/smm/actions/admin-services";

export function DeleteServiceButton({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="danger">
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        title="حذف الخدمة نهائيًا؟"
        description={`سيتم حذف "${serviceName}" نهائيًا من اللوحة. إذا كانت الخدمة مستوردة من مزود، يمكنك استيرادها من جديد لاحقًا. لن يتم الحذف إذا كانت مرتبطة بطلبات سابقة.`}
      >
        <div className="flex items-center justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              إلغاء
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="danger"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteServiceAction(serviceId);
                  if (!res.ok) toast.error(res.error);
                  else toast.success("تم حذف الخدمة");
                })
              }
            >
              حذف نهائيًا
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
