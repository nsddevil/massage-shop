import { auth } from "./auth";
import { headers } from "next/headers";
import { AuthUser, ActionResponse } from "@/types";

/**
 * 현재 로그인한 사용자의 세션을 가져옵니다.
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * 현재 사용자가 사장(OWNER) 또는 관리자(admin)인지 확인합니다.
 */
export async function isOwner() {
  const session = await getSession();
  if (!session) return false;

  const user = session.user as AuthUser;
  const role = user.role;
  return role === "OWNER" || role === "admin";
}

/**
 * 사장 권한이 필요한 동작에서 권한을 검증하고 실패 시 에러 객체를 반환합니다.
 */
export async function validateOwner(): Promise<ActionResponse> {
  const owner = await isOwner();
  if (!owner) {
    return {
      success: false,
      error: "이 작업을 수행할 권한이 없습니다. (사장님 전용)",
    };
  }
  return { success: true };
}
