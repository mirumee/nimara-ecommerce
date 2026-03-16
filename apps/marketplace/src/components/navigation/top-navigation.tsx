"use client";

import {
  CircleDollarSign,
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
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { createStripeConnectLoginSession } from "@/app/(authenticated)/_actions/stripe-connect";
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

const navigationLinks = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/products", icon: Package },
  { key: "orders", href: "/orders", icon: ShoppingCart },
  { key: "drafts", href: "/drafts", icon: FileText },
  { key: "collections", href: "/collections", icon: LayoutList },
  { key: "customers", href: "/customers", icon: Users },
] as const;

export function TopNavigation() {
  const t = useTranslations("marketplace.navigation");
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const vendorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    t("vendor-fallback");
  const hasStripeAccount = Boolean(user?.stripePaymentAccountId);

  const handleOpenStripe = async () => {
    if (!hasStripeAccount || isOpeningStripe) {
      return;
    }

    setIsOpeningStripe(true);

    try {
      const result = await createStripeConnectLoginSession();

      if (!result.ok) {
        console.error("[stripe-connect] Failed to open Stripe:", result.error);

        return;
      }

      window.open(result.url, "_blank", "noopener,noreferrer");
    } finally {
      setIsOpeningStripe(false);
    }
  };

  return (
    <header className="sticky left-0 right-0 top-0 z-50 w-full border-b bg-background">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold">
            {t("app-name")}
          </Link>

          <nav className="flex items-center gap-1">
            {navigationLinks.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
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
                  <span>{t(item.key)}</span>
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
              {t("invite-coworkers")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <span className="flex h-4 w-4 items-center justify-center text-xs">
                ?
              </span>
              {t("support")}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/configuration/general"
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4" />
                {t("configuration")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => void handleOpenStripe()}
              disabled={!hasStripeAccount || isOpeningStripe}
            >
              <CircleDollarSign className="h-4 w-4" />
              {t("go-to-stripe")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Monitor className="h-4 w-4" />
              {t("sign-out-devices")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t("sign-out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
