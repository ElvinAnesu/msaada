"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  user: SessionUser;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  navItems,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const active =
          item.href === "/dashboard/agent" || item.href === "/dashboard/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary-light text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            Hesu Help Desk
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks />
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 truncate text-sm">
            <p className="font-medium text-slate-900">{user.full_name}</p>
            <p className="text-slate-500 capitalize">{user.role}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/" className="text-lg font-bold text-primary">
          Hesu Help Desk
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-bold text-primary">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1 p-4">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <p className="mb-2 text-sm font-medium">{user.full_name}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                loading={loggingOut}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
        {navItems.slice(0, 4).map((item) => {
          const active =
            item.href === "/dashboard/agent" || item.href === "/dashboard/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center py-2 text-xs",
                active ? "text-primary" : "text-slate-500"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
