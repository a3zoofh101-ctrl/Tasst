import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

export default async function globalSetup() {
  config({ path: ".env" });
  const base = process.env.DATABASE_URL;
  if (!base) throw new Error("DATABASE_URL is not set");
  const testUrl = base.includes("_test") ? base : base.replace(/\/([^/?]+)(\?|$)/, "/$1_test$2");

  const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "AuditLog", "Notification", "SupportMessage", "SupportTicket",
        "Payment", "WalletTransaction", "Order", "ServiceFavorite",
        "Service", "ProviderService", "Provider", "Category", "Platform",
        "PasswordResetToken", "Session", "Wallet", "Setting", "User"
      RESTART IDENTITY CASCADE
    `);
  } finally {
    await prisma.$disconnect();
  }
}
