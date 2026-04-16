"use client";

import {
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { AppOptionsTab } from "@/app/app/_components/app-options-tab";
import { AppPayoutsOverviewTab } from "@/app/app/_components/app-payouts-overview-tab";
import { AppVendorsTab } from "@/app/app/_components/app-vendors-tab";
import { APP_CONFIG } from "@/lib/saleor/consts";
import { useAuth } from "@/providers/auth-provider";

export function AppPageClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="payouts">
            {t("marketplace.payouts.tab-label")}
          </TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-4">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{APP_CONFIG.NAME}</CardTitle>
              <CardDescription className="text-base">
                Vendor app for the Saleor marketplace. Manage your products,
                orders, and warehouses in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-primary" />
                  View registered vendors and customers
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="options" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Options
              </CardTitle>
              <CardDescription>
                Configure the vendor profile model and other app settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppOptionsTab />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vendors" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Vendors Management</CardTitle>
              <CardDescription>
                Manage your vendors and customers in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppVendorsTab
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payouts" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t("marketplace.payouts.title")}
              </CardTitle>
              <CardDescription>
                {t("marketplace.payouts.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppPayoutsOverviewTab
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
