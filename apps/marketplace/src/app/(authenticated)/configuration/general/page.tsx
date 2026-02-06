import { Edit, Upload } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

export default async function ConfigurationGeneralPage() {
  const token = await getServerAuthToken();
  const result = await configurationService.getMe(token);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load user data</p>
      </div>
    );
  }

  const user = result.data.me;
  const vendorName =
    user?.firstName || user?.email || "Vendor name";
  const vendorUrl = `marketplace.com/${String(vendorName).toLowerCase().replace(/\s+/g, "-")}`;
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">General</h1>

      {/* Basic Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Basic info</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 bg-stone-100">
              <AvatarFallback className="text-2xl font-medium text-stone-600">
                {vendorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {vendorName}
              </div>
              <div className="text-muted-foreground text-sm">{vendorUrl}</div>
              {fullName && (
                <div className="mt-1 text-sm text-gray-600">{fullName}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Photo Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cover photo</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Recommended dimensions: 1920×512px
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>
              Delete
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Reupload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <span className="text-muted-foreground text-sm">(cover photo)</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact info</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Email</label>
              <div className="mt-1 text-sm text-gray-600">
                {user?.email || "Not set"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Phone</label>
              <div className="mt-1 text-sm text-gray-600">
                {user?.addresses?.[0]?.phone || "Not set"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
