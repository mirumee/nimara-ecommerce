interface ResponseErrorInput {
  details?: unknown;
  error: string;
  status: number;
}

export const responseError = ({ details, error, status }: ResponseErrorInput) =>
  Response.json(
    {
      error,
      ...(details ? { details } : {}),
    },
    { status },
  );
