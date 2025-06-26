import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://api.utilbox.de/graphql",
);

export { client };
export * from "./types/authTypes";
export * from "./types/userTypes";

export * from "./queries/ticketQueries";
export * from "./queries/userQueries";
export * from "./queries/companyQueries";
export * from "./queries/timeQueries";
export * from "./queries/dashboardQueries";
export * from "./queries/attachmentQueries";

export * from "./mutations/ticketMutations";
export * from "./mutations/authMutations";
export * from "./mutations/commentMutations";
export * from "./mutations/timeMutations";
export * from "./mutations/companyMutations";
export * from "./mutations/attachmentMutations";
export * from "./mutations/userMutations";

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}
