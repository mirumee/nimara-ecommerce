"use client";

import {
  FileText,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Monitor,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const APP_NAME = "Vendor Panel";

const navigationLinks = [
  {
    labelKey: "common.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "common.products",
    href: "/products",
    icon: Package,
  },
  {
    labelKey: "common.orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    labelKey: "common.drafts",
    href: "/drafts",
    icon: FileText,
  },
  {
    labelKey: "common.collections",
    href: "/collections",
    icon: LayoutList,
  },
  {
    labelKey: "common.customers",
    href: "/customers",
    icon: Users,
  },
];

export function TopNavigation() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const vendorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Vendor";

  return (
    <header className="sticky left-0 right-0 top-0 z-50 w-full border-b bg-background">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold">
            {APP_NAME}
          </Link>

          <nav className="flex items-center gap-1">
            {navigationLinks.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-stone-100 text-stone-900"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full p-1",
                      active ? "bg-stone-200" : "bg-stone-100",
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                  </div>
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary hover:text-primary-foreground">
              <Avatar className="h-8 w-8 bg-stone-900">
                <AvatarFallback className="font-medium text-stone-900">
                  {vendorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{vendorName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="border-b px-3 py-2">
              <div className="text-sm font-medium">{vendorName}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Users className="h-4 w-4" />
              Invite co-workers
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <span className="flex h-4 w-4 items-center justify-center text-xs">
                ?
              </span>
              Support
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/configuration/general"
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4" />
                Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Monitor className="h-4 w-4" />
              Sign out from other devices
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
