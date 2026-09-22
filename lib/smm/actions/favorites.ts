"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";

export async function toggleFavoriteAction(serviceId: string) {
  const user = await requireUser();

  const existing = await prisma.serviceFavorite.findUnique({
    where: { userId_serviceId: { userId: user.id, serviceId } }
  });

  if (existing) {
    await prisma.serviceFavorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.serviceFavorite.create({ data: { userId: user.id, serviceId } });
  }

  revalidatePath("/dashboard/services");
  return { favorited: !existing };
}
