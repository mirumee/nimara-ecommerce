import { BaseAggregateError, BaseError } from "@/lib/error/base";

export class GraphQLClientHttpError extends BaseError {}

export class GraphQLClientInvalidResponseError extends BaseError {}

export class GraphQLClientMultiGraphQLError extends BaseAggregateError {}
