export { client } from './graphql-client';
export * from './types/authTypes';
export * from './types/commonTypes'
export * from './types/companyTypes'
export * from './types/dashboardTypes'
export * from './types/filterTypes'
export * from './types/inputTypes'
export * from './types/responseTypes'
export * from './types/ticketTypes'
export * from './types/userTypes';
export * from './types/auditTypes';



export * from './queries/ticketQueries';
export * from './queries/userQueries';
export * from './queries/companyQueries';
export * from './queries/timeQueries';
export * from './queries/dashboardQueries';
export * from './queries/attachmentQueries';
export * from './queries/auditQueries';

export * from './mutations/ticketMutations';
export * from './mutations/authMutations';
export * from './mutations/commentMutations';
export * from './mutations/timeMutations';
export * from './mutations/companyMutations';
export * from './mutations/attachmentMutations';
export * from './mutations/userMutations'

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
