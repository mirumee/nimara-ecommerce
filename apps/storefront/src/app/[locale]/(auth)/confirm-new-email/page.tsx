import { confirmEmailChangeAction } from "./actions";

export default async function ConfirmEmailChangePage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;

  await confirmEmailChangeAction(searchParams ?? {});

  return null;
}
