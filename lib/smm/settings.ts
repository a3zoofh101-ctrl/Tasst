import "server-only";
import { prisma } from "@/lib/smm/db/prisma";

export const SETTING_DEFAULTS = {
  siteName: "بوست",
  supportEmail: "support@tasst.local",
  minDepositAmount: "10",
  maxDepositAmount: "50000"
};

export type PlatformSettings = typeof SETTING_DEFAULTS;

// Single source of truth for the admin-configurable settings — read here
// by both the admin settings page and anything that needs to enforce them
// (e.g. deposit min/max), instead of each spot re-reading prisma.setting
// and falling back to its own hardcoded defaults.
export async function getSettings(): Promise<PlatformSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((s) => [s.key, s.value]));

  return {
    siteName: String(map.siteName ?? SETTING_DEFAULTS.siteName),
    supportEmail: String(map.supportEmail ?? SETTING_DEFAULTS.supportEmail),
    minDepositAmount: String(map.minDepositAmount ?? SETTING_DEFAULTS.minDepositAmount),
    maxDepositAmount: String(map.maxDepositAmount ?? SETTING_DEFAULTS.maxDepositAmount)
  };
}
