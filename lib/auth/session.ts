import { createAdminClient } from "@/lib/supabase/admin";
import { SessionUser } from "@/lib/types";
import { getAccessToken, getRefreshToken } from "@/lib/auth/cookies";

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createAdminClient();
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken && !refreshToken) return null;

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      return fetchProfile(data.user.id);
    }
  }

  // Refresh in-memory only — cookie updates happen in middleware / route handlers
  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (!error && data.session) {
      return fetchProfile(data.session.user.id);
    }
  }

  return null;
}

async function fetchProfile(userId: string): Promise<SessionUser | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("id", userId)
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data as SessionUser;
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "agent":
      return "/dashboard/agent";
    default:
      return "/dashboard/customer";
  }
}
