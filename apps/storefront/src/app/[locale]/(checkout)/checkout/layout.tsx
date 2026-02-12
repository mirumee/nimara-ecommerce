import { Footer } from "@/features/footer";
import { Logo } from "@/features/header/logo";
import { ThemeToggle } from "@/features/header/theme-toggle";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <header className="container flex items-center justify-between">
        <div className="container bg-background px-0 py-4">
          <Logo />
        </div>

        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </header>

      <main className="bg-stone-100 py-8 dark:bg-stone-900">
        <div className="container">{children}</div>
      </main>

      <footer className="container">{/* Footer */}</footer>
    </div>
  );
}
