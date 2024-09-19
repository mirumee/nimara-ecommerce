import { Globe } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Dialog, DialogTrigger } from "@nimara/ui/components/dialog";

import type { Region } from "@/regions/types";

import { LocaleSwitchModal } from "./locale-modal";

export const LocaleSwitch = ({ region }: { region: Region }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="default" className="gap-1.5">
          <Globe className="h-4 w-4" /> {region.market.id.toLocaleUpperCase()}
        </Button>
      </DialogTrigger>
      <LocaleSwitchModal region={region} />
    </Dialog>
  );
};

LocaleSwitch.displayName = "LocaleSwitch";
