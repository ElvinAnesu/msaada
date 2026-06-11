import { readFileSync } from "fs";
import { resolve } from "path";
import { createAdminClient } from "../lib/supabase/admin";

function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    // .env.local optional when vars are already set
  }
}

loadEnvLocal();

async function seedAdmin() {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", "elvin")
    .maybeSingle();

  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const email = "elvin@msaada.local";
  const password = "1234";

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: "elvin", full_name: "Elvin Kakomo" },
    });

  if (authError || !authUser.user) {
    console.error("Failed to create admin:", authError?.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    username: "elvin",
    full_name: "Elvin Kakomo",
    email,
    phone: "",
    role: "admin",
  });

  if (profileError) {
    console.error("Failed to create admin profile:", profileError.message);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log("Admin user seeded: elvin / 1234");
}

seedAdmin();
