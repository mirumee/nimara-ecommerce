import { config } from "dotenv";

import { appCodegenConfig } from "@nimara/codegen/preset";

config({ quiet: true });

// eslint-disable-next-line import/no-default-export
export default appCodegenConfig();
