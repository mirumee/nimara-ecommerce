"use client";

import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { getSaleorDomainHeader } from "@/lib/graphql/client";
import { useAuth } from "@/providers/auth-provider";

export function AppOptionsTab() {
  const { dashboardContext } = useAuth();
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const { toast } = useToast();
  const [vendorProfileExists, setVendorProfileExists] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (!dashboardContext) {
      setVendorProfileExists(null);

      return;
    }

    const domain = getSaleorDomainHeader()["x-saleor-domain"];

    if (!domain) {
      setVendorProfileExists(null);

      return;
    }

    const check = async () => {
      try {
        const res = await fetch("/api/saleor/bootstrap", {
          headers: { "x-saleor-domain": domain },
        });
        const data = (await res.json()) as { exists?: boolean };

        setVendorProfileExists(data.exists ?? false);
      } catch {
        setVendorProfileExists(null);
      }
    };

    void check();
  }, [dashboardContext]);

  const handleBootstrap = async () => {
    const domainHeader = getSaleorDomainHeader();
    const domain = domainHeader["x-saleor-domain"];

    if (!domain) {
      toast({
        description:
          "Cannot determine Saleor domain. Open the app from Saleor dashboard.",
        variant: "destructive",
      });

      return;
    }

    setBootstrapLoading(true);

    try {
      const res = await fetch("/api/saleor/bootstrap", {
        method: "POST",
        headers: { "x-saleor-domain": domain },
      });
      const data = (await res.json()) as {
        details?: string;
        error?: string;
        skipped?: boolean;
        status?: string;
      };

      if (!res.ok) {
        toast({
          description: data.details ?? data.error ?? "Bootstrap failed",
          variant: "destructive",
        });

        return;
      }

      toast({
        description: data.skipped
          ? "Vendor profile model already exists."
          : "Vendor profile model created successfully.",
      });

      setVendorProfileExists(true);
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Bootstrap failed",
        variant: "destructive",
      });
    } finally {
      setBootstrapLoading(false);
    }
  };

  if (!dashboardContext) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Open the app from Saleor dashboard to configure options.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Vendor profile model</h3>
        <p className="text-sm text-muted-foreground">
          Create the vendor profile page type in Saleor if it does not exist
          yet. This is required to manage vendors.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBootstrap}
            disabled={bootstrapLoading || vendorProfileExists === true}
          >
            {bootstrapLoading ? "Setting up…" : "Setup vendor profile model"}
          </Button>
        </div>
      </div>
    </div>
  );
}
