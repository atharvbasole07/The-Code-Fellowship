import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadDotEnvFile(path.resolve(process.cwd(), ".env"));
loadDotEnvFile(path.resolve(process.cwd(), ".env.local"));

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const AUTH_USERS = [
  { email: "commissioner@pune.gov.in", password: "binwatch-demo", role: "user" },
  { email: "driver@pune.gov.in", password: "binwatch-demo", role: "driver" },
];

const missing = [];
if (!SUPABASE_URL) missing.push("SUPABASE_URL or VITE_SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length > 0) {
  console.error(`Missing ${missing.join(" and ")}. Set it in .env/.env.local or your shell before running this script.`);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;

    page += 1;
  }
}

async function ensureAuthUser({ email, password, role }) {
  const existing = await findUserByEmail(email);

  if (!existing) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { role },
    });

    if (error) throw error;
    console.log(`Created auth user: ${data.user?.email}`);
    return;
  }

  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: { ...(existing.app_metadata ?? {}), role },
    user_metadata: { ...(existing.user_metadata ?? {}), role },
  });

  if (error) throw error;
  console.log(`Updated auth user: ${existing.email}`);
}

async function main() {
  for (const user of AUTH_USERS) {
    await ensureAuthUser(user);
  }
  console.log("Auth seeding complete.");
}

main().catch((error) => {
  console.error("Auth seeding failed:", error.message);
  process.exit(1);
});
