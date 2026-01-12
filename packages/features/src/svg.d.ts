declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;

  // eslint-disable-next-line import/no-default-export
  export default content;
}

declare module "*.svg?url" {
  const content: string;

  // eslint-disable-next-line import/no-default-export
  export default content;
}
