"use client";

import { Package, ShoppingCart, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { APP_CONFIG } from "@/lib/saleor/consts";
import { useAuth } from "@/providers/auth-provider";

export default function AppPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{APP_CONFIG.NAME}</CardTitle>
          <CardDescription className="text-base">
            Vendor app for the Saleor marketplace. Manage your products, orders,
            and warehouses in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-primary" />
              Manage your product catalog and variants
            </li>
            <li className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 shrink-0 text-primary" />
              View and fulfill orders from the marketplace
            </li>
            <li className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 shrink-0 text-primary" />
              Configure warehouses and stock
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
