import { getSessionUser } from "@/lib/auth/session";
import { apiSuccess } from "@/lib/api-helpers";

export async function GET() {
  const user = await getSessionUser();
  return apiSuccess({ user });
}
