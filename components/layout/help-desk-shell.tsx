import Link from "next/link";

interface HelpDeskShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export function HelpDeskShell({
  children,
  breadcrumb = "Hesu Help Desk",
}: HelpDeskShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="bg-primary text-white">
        <div className="mx-auto flex h-12 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Hesu Help Desk
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-slate-700">{breadcrumb}</span>
        </nav>
      </div>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-surface py-6 text-center text-xs text-slate-500">
        <p>Powered by Hesu Software Division</p>
        <p className="mt-1">© {new Date().getFullYear()} Hesu</p>
      </footer>
    </div>
  );
}
