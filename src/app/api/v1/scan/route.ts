import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../nextAuthOptions";
import { getLogger } from "../../../../services/logger";

import { scanService } from "../../../../scanner/scanService";
import { InspectionType } from "../../../../scanner/scans";
import { monitoringService } from "../../../../services/monitoringService";
import { DetailedTarget } from "../../../../types";
import { isScanError } from "../../../../utils/common";
import { DTO, getServerSession } from "../../../../utils/server";
import { staticSecrets } from "../../../../utils/staticSecrets";
import { displayInspections } from "../../../../utils/view";

const logger = getLogger(__filename);

const limitToDisplayedInspections = <
  T extends { details: Record<string, any> | null }
>(
  obj: T
): T => {
  const { details, ...rest } = obj;
  const displayedInspections = Object.fromEntries(
    Object.entries(details || {}).filter(
      ([key]) =>
        key === "sut" || displayInspections.includes(key as InspectionType)
    )
  );
  return {
    ...rest,
    details: displayedInspections,
  } as T;
};

// exporting for testing purposes
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("s");
  const session = await getServerSession(authOptions);
  const site = req.nextUrl.searchParams.get("site");
  const refresh = req.nextUrl.searchParams.get("refresh");

  if (!session && (!secret || !staticSecrets[secret])) {
    logger.error(`invalid secret provided: ${secret}`);
    return NextResponse.json(
      {
        error: "Invalid secret provided",
        uri: site as string,
      },
      { status: 401 }
    );
  }

  // check if the client does provide a request id.
  // if so, use this - otherwise generate a new one.
  const requestId =
    (req.headers.get("x-request-id") as string | undefined) ?? randomUUID();

  try {
    const [result, detailedTarget] = await scanService.scanTargetRPC(
      requestId,
      site,
      {
        refreshCache: refresh === "true",
        socks5Proxy: req.nextUrl.searchParams.get("socks5Proxy") ?? undefined,
        startTimeMS: Date.now(),
      }
    );
    monitoringService.trackApiCall(
      result.target,
      (secret as string) || session?.user?.id
    );
    if (isScanError(result)) {
      return NextResponse.json(
        {
          error: result.result.error.code,
          uri: result.target,
        },
        { status: 422 }
      );
    } else {
      return NextResponse.json(
        limitToDisplayedInspections(detailedTarget as DTO<DetailedTarget>)
      );
    }
  } catch (e: any) {
    logger.error({ requestId, err: e.message }, `could not scan site: ${site}`);
    return NextResponse.json(
      {
        error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${site}`,
        uri: site as string,
      },
      { status: 400 }
    );
  }
}
