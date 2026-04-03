"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const configNavigation = [
  { name: "General", href: "/configuration/general" },
  { name: "Channels & warehouses", href: "/configuration/channels" },
];

export function ConfigurationNavClient() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-3">
      {configNavigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.name} href={item.href}>
            <div
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-gray-200 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              {item.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
