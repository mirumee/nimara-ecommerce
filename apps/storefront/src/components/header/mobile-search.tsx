"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Sheet, SheetContent } from "@nimara/ui/components/sheet";

import { SearchForm } from "@/components/header/search-form";
import { usePathname } from "@/i18n/routing";

export const MobileSearch = () => {
  const t = useTranslations("search");

  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseSheet = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="gap-1 md:hidden"
        aria-label={t("open-search")}
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
        aria-label={t("search-label")}
        modal={true}
      >
        <SheetContent side="top" closeClassName="right-2 top-2">
          <SearchForm onSubmit={handleCloseSheet} />
        </SheetContent>
      </Sheet>
    </>
  );
};
