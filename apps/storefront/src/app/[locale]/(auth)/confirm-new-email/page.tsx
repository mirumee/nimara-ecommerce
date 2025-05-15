import { getTranslations } from "next-intl/server";

import { confirmEmailChangeAction } from "./actions";

export default async function ConfirmEmailChangePage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const t = await getTranslations();

  const searchParams = await props.searchParams;

  const result = await confirmEmailChangeAction(searchParams ?? {});

  if (!result.ok && result.errors?.length) {
    return (
      <div>
        {result.errors.map((error, i) => (
          <p key={i}>{t(`errors.${error.code}`)}</p>
        ))}
      </div>
    );
  }

  return null;
}
