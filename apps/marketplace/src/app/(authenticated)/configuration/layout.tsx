"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MeDocument } from "@/graphql/queries/generated";
import { useGraphQLQuery } from "@/hooks/use-graphql-query";
import { cn } from "@/lib/utils";

const configNavigation = [
  { name: "General", href: "/configuration/general" },
  { name: "Channels & warehouses", href: "/configuration/channels" },
];

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: meData } = useGraphQLQuery(MeDocument);
  const vendorName =
    meData?.me?.firstName || meData?.me?.email || "Vendor name";
  const vendorUrl = `marketplace.com/${String(vendorName).toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="-mx-6 -mt-4 flex min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 border-r bg-gray-50">
        {/* Vendor info header */}
        <div className="border-b bg-white p-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-stone-100">
              <AvatarFallback className="font-medium text-stone-600">
                {vendorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                {vendorName}
              </div>
              <div className="text-muted-foreground text-xs">{vendorUrl}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          {configNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-gray-200 font-medium text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
