import { type PropsWithChildren } from "react";

import { FormControl, FormItem, FormLabel } from "@nimara/ui/components/form";
import { RadioGroupItem } from "@nimara/ui/components/radio-group";

export const MethodFormItem = ({
  value,
  children,
}: { value: string } & PropsWithChildren) => {
  return (
    <FormItem className="border first:rounded-t last:rounded-b [&:not(:last-child)]:border-b-0">
      <FormLabel className="!mt-0 flex w-full cursor-pointer gap-2 p-4">
        <FormControl>
          <RadioGroupItem value={value} />
        </FormControl>
        <div className="grid w-full text-sm font-medium leading-5">
          {children}
        </div>
      </FormLabel>
    </FormItem>
  );
};
