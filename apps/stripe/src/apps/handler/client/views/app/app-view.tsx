import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { ConfigForm } from "./config-form";

export const AppView = () => {
  return (
    <div className="flex flex-col gap-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            App <strong>v{window.env.VERSION}</strong>
          </CardDescription>
        </CardHeader>
      </Card>
      <ConfigForm />
    </div>
  );
};
