import { redirect } from "next/navigation";
import { getSessionUser, getDashboardPath } from "@/lib/auth/session";

export default async function TrackTicketsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/customer");
  }
  redirect(getDashboardPath(user.role));
}
