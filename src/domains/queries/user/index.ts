import type { GetAllUsersResult } from 'use-cases/users/query/get-all-users/result';

export interface GetAllUsersPayload {
  page: number;
  limit: number;
}

export abstract class IUserQueryModal {
  abstract getAllUsers(
    payload: GetAllUsersPayload,
  ): Promise<GetAllUsersResult[]>;
  // abstract getUserById(id: number): Promise<any | null>;
  // abstract getUserByEmail(email: string): Promise<any | null>;
}
