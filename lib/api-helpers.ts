import { NextResponse } from "next/server";
import { SessionUser } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";

export function zodFirstError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message || "Validation failed";
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth(
  roles?: SessionUser["role"][]
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }
  if (roles && !roles.includes(user.role)) {
    return apiError("Forbidden", 403);
  }
  return { user };
}
