import { useSession as baseUseSession } from "next-auth/react";
import { ISession } from "../types";
export function useSession() {
  return baseUseSession() as {
    data: ISession | dashboardEnabledl;
    status: string;
  };
}
