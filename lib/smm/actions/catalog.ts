"use server";

import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import type { ServiceOption } from "@/components/smm/dashboard/NewOrderWizard";
import type { ServiceDto } from "@/components/smm/dashboard/ServicesExplorer";

// Both the new-order wizard and the services browser used to be handed
// EVERY Service row up front (no platform/take filter), then filtered
// entirely client-side. That shipped the whole catalog — ~5,000 rows in
// production — to every mobile visit, which is the main reason the site
// felt heavy. These fetch only what the current view actually needs.

export async function getPlatformServicesAction(platformId: string): Promise<ServiceOption[]> {
  await requireUser();
  if (!platformId) return [];

  const services = await prisma.service.findMany({
    where: { platformId },
    include: { category: true },
    orderBy: { name: "asc" }
  });

  return services.map((s) => ({
    id: s.id,
    providerRefId: s.providerRefId,
    name: s.name,
    description: s.description,
    platformId: s.platformId,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    pricePer1000: s.pricePer1000.toFixed(2),
    minQuantity: s.minQuantity,
    maxQuantity: s.maxQuantity,
    refill: s.refill,
    cancelSupported: s.cancelSupported,
    averageTime: s.averageTime,
    available: s.active
  }));
}

const EXPLORER_PAGE_SIZE = 60;

export type ServiceSort = "name" | "price-asc" | "price-desc";

export async function searchServicesAction(params: {
  platformId?: string;
  categoryId?: string;
  q?: string;
  sort?: ServiceSort;
}): Promise<ServiceDto[]> {
  const user = await requireUser();

  const services = await prisma.service.findMany({
    where: {
      active: true,
      ...(params.platformId ? { platformId: params.platformId } : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.q?.trim() ? { name: { contains: params.q.trim(), mode: "insensitive" } } : {})
    },
    include: { platform: true, category: true },
    orderBy: params.sort === "price-asc" ? { pricePer1000: "asc" } : params.sort === "price-desc" ? { pricePer1000: "desc" } : { name: "asc" },
    take: EXPLORER_PAGE_SIZE
  });

  if (services.length === 0) return [];

  const favorites = await prisma.serviceFavorite.findMany({
    where: { userId: user.id, serviceId: { in: services.map((s) => s.id) } },
    select: { serviceId: true }
  });
  const favoriteIds = new Set(favorites.map((f) => f.serviceId));

  return services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    platformId: s.platformId,
    platformName: s.platform.name,
    platformSlug: s.platform.slug,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    pricePer1000: s.pricePer1000.toFixed(2),
    minQuantity: s.minQuantity,
    maxQuantity: s.maxQuantity,
    refill: s.refill,
    cancelSupported: s.cancelSupported,
    averageTime: s.averageTime,
    favorited: favoriteIds.has(s.id)
  }));
}

export async function getFavoriteServicesAction(): Promise<ServiceDto[]> {
  const user = await requireUser();

  const favorites = await prisma.serviceFavorite.findMany({
    where: { userId: user.id },
    include: { service: { include: { platform: true, category: true } } },
    orderBy: { createdAt: "desc" }
  });

  return favorites
    .filter((f) => f.service.active)
    .map((f) => ({
      id: f.service.id,
      name: f.service.name,
      description: f.service.description,
      platformId: f.service.platformId,
      platformName: f.service.platform.name,
      platformSlug: f.service.platform.slug,
      categoryId: f.service.categoryId,
      categoryName: f.service.category.name,
      pricePer1000: f.service.pricePer1000.toFixed(2),
      minQuantity: f.service.minQuantity,
      maxQuantity: f.service.maxQuantity,
      refill: f.service.refill,
      cancelSupported: f.service.cancelSupported,
      averageTime: f.service.averageTime,
      favorited: true
    }));
}
