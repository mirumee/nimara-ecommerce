import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { ConfigForm } from "./form";

export default function Page() {
  return (
    <div className="flex flex-col gap-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            App <strong>v{process.env.npm_package_version}</strong>
          </CardDescription>
          <CardDescription>
            Stripe API <strong>v2020-08-27</strong>
          </CardDescription>
        </CardHeader>
      </Card>
      <ConfigForm />
    </div>
  );
}
