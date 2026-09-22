import { config } from "dotenv";

config({ path: ".env" });

// Never let tests touch the dev database — always redirect to a sibling
// "_test" database derived from DATABASE_URL.
const base = process.env.DATABASE_URL;
if (base && !base.includes("_test")) {
  process.env.DATABASE_URL = base.replace(/\/([^/?]+)(\?|$)/, "/$1_test$2");
}

