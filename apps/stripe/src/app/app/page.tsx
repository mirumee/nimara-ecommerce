import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { headers } from "next/headers";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { CONFIG } from "@/config";

import { ConfigForm } from "./form";

export default async function Page() {
  return (
    <div className="flex flex-col gap-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            App <strong>v{CONFIG.VERSION}</strong>
          </CardDescription>
          <CardDescription>
            Stripe API <strong>v{CONFIG.STRIPE_API_VERSION}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      <ConfigForm />
    </div>
  );
}
