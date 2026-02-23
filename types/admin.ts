import { ActionResponse } from "./common";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  createdAt: Date;
}

export type UsersResponse = ActionResponse<UserData[]>;
export type UpdateRoleResponse = ActionResponse;
