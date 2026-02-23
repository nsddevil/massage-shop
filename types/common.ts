export type ActionResponse<T = undefined> =
  | (T extends undefined
      ? { success: true; data?: T; error?: never }
      : { success: true; data: T; error?: never })
  | { success: false; error: string; data?: never };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  image?: string | null;
}
