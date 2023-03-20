import { isGuestUser } from "../utils/common";
import { useSession } from "./useSession";

export function useIsGuest() {
  const session = useSession();
  return isGuestUser(session.data?.user);
}
