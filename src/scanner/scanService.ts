import { PrismaClient, Target } from "@prisma/client";
import { prisma } from "../db/connection";
import { GlobalRef } from "../services/globalRef";
import { getLogger } from "../services/logger";
import { rabbitMQRPCClient } from "../services/rabbitmqClient";
import { reportService } from "../services/reportService";
import {
  startTimeOfResponse,
  transformDeprecatedReportingSchemaToSarif,
} from "../services/sarifTransformer";
import { targetService } from "../services/targetService";
import {
  DetailedTarget,
  DetailsJSON,
  ISarifResponse,
  ISarifScanErrorResponse,
  ISarifScanSuccessResponse,
} from "../types";
import CircuitBreaker from "../utils/CircuitBreaker";
import {
  defaultOnError,
  isScanError,
  neverThrow,
  sanitizeURI,
  timeout,
} from "../utils/common";
import { DTO, toDTO } from "../utils/server";
import { OrganizationalInspectionType } from "./scans";

export interface ScanTargetOptions {
  refreshCache: boolean; // if refresh is true, it will bypass all caching layers
  socks5Proxy?: string; // if provided, the scan will be performed through the proxy
  startTimeMS: number;
}

interface MessageBrokerClient {
  call<T extends Record<string, any>>(
    queue: string,
    message: Record<string, any>,
    options: Record<string, any> & { messageId: string }
  ): Promise<T>;

  send(
    queue: string,
    message: Record<string, any>,
    queueOptions?: any,
    options?: any
  ): Promise<void>;
}

const logger = getLogger(__filename);

export class ScanService {
  private scanCB = new CircuitBreaker(10);

  constructor(
    private messageBrokerClient: MessageBrokerClient,
    private db: PrismaClient
  ) {}

  // wont save the result to the database
  // use scanTargetRPC instead
  public async scanRPC(
    requestId: string,
    target: string,
    options: ScanTargetOptions
  ): Promise<ISarifResponse> {
    const result = await this.messageBrokerClient.call<ISarifResponse>(
      process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
      {
        target,
        refresh: options.refreshCache, // if refresh is true, it will bypass all caching layers,
        socks5Proxy: options.socks5Proxy,
      },
      { messageId: requestId }
    );
    console.log("result", result);
    return result;
  }

  public async handleScanResponse(
    requestId: string,
    response: ISarifResponse,
    options: ScanTargetOptions
  ): Promise<DTO<DetailedTarget> | undefined> {
    if (isScanError(response)) {
      await neverThrow(
        this.scanCB.run(
          async () =>
            await timeout(
              targetService.handleTargetScanError(response, this.db)
            )
        )
      );
      return undefined;
    } else {
      return defaultOnError(
        this.scanCB.run(async () =>
          timeout(
            reportService.handleNewScanReport(
              requestId,
              response,
              this.db,
              options
            )
          )
        ),
        {
          uri: response.runs[0].properties.target,
          lastScan: startTimeOfResponse(response).getTime(),
          hostname: "",
          errorCount: 0,
          number: 0,
          queued: false,
          createdAt: startTimeOfResponse(response).toString(),
          updatedAt: startTimeOfResponse(response).toString(),
          details: response,
        }
      );
    }
  }
  // this fires an asynchronous request - it does not wait for the result
  public async scanTarget(
    requestId: string,
    target: string,
    options: ScanTargetOptions
  ) {
    const result = await this.messageBrokerClient.send(
      process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
      {
        target,
        refresh: options.refreshCache, // if refresh is true, it will bypass all caching layers,
        socks5Proxy: options.socks5Proxy,
      },
      { durable: true, maxPriority: 10 },
      { messageId: requestId, priority: 1, replyTo: "scan-response" }
    );
    return result;
  }

  async checkInCache(target: string) {
    return toDTO(
      await neverThrow(
        this.db.lastScanDetails.findFirst({
          include: {
            target: true,
          },
          where: {
            uri: target,
            updatedAt: {
              // last hour
              gte: new Date(Date.now() - 1000 * 60 * 60 * 1),
            },
          },
        })
      )
    ) as DTO<
      | ({ details: DetailsJSON } & {
          target: Omit<Target, "lastScan"> & { lastScan: number };
        })
      | (ISarifScanSuccessResponse & {
          target: Omit<Target, "lastScan"> & { lastScan: number };
        })
      | null
    >;
  }

  // abstracts the whole app functionality for rpc calls.
  // it makes sure, that the database is in a consistent state.
  // do not use the response to update the database.
  async scanTargetRPC(
    requestId: string,
    target: string | null,
    options: ScanTargetOptions
  ): Promise<
    | [DTO<ISarifScanSuccessResponse>, DTO<DetailedTarget>]
    | [DTO<ISarifScanErrorResponse>, undefined]
  > {
    const sanitizedURI = sanitizeURI(target);
    if (!sanitizedURI) {
      throw new Error("invalid target");
    }

    logger.debug({ requestId }, `received request to scan site: ${target}`);
    const start = Date.now();

    if (!options.refreshCache) {
      // check if it already inside the cache
      const details = await this.checkInCache(sanitizedURI);
      if (details) {
        logger.info(
          { requestId },
          `found existing report for site: ${sanitizedURI} - returning existing report`
        );

        const { target, ...rest } = details;
        const transformed = transformDeprecatedReportingSchemaToSarif(rest);
        return [transformed, { ...target, details: transformed }];
      } else {
        logger.info(
          { requestId },
          `no existing report for site: ${sanitizedURI} - starting new scan`
        );
      }
    }
    const result = await this.scanRPC(requestId, sanitizedURI, options);
    console.log(
      result.runs[0].results.find(
        (r) => r.ruleId === OrganizationalInspectionType.ResponsibleDisclosure
      )
    );
    let detailedTarget: DTO<DetailedTarget> | undefined = undefined;
    if (isScanError(result)) {
      await neverThrow(
        this.scanCB.run(
          async () =>
            await timeout(targetService.handleTargetScanError(result, this.db))
        )
      );
    } else {
      logger.info(
        { duration: Date.now() - start, requestId },
        `successfully scanned site: ${target}`
      );

      detailedTarget = await defaultOnError(
        this.scanCB.run(
          async () =>
            timeout(
              reportService.handleNewScanReport(
                requestId,
                result,
                this.db,
                options
              ),
              40_000
            ) // use a 20 seconds timeout - it might happen, that the reportService will verify that the reports did really change and therefore issue another scan.
        ),
        {
          uri: result.runs[0].properties.target,
          lastScan: startTimeOfResponse(result).getTime(),
          hostname: "",
          errorCount: 0,
          number: 0,
          queued: false,
          createdAt: startTimeOfResponse(result).toString(),
          updatedAt: startTimeOfResponse(result).toString(),
          details: result,
        }
      );
    }

    return [result, detailedTarget] as
      | [ISarifScanSuccessResponse, DTO<DetailedTarget>]
      | [ISarifScanErrorResponse, undefined];
  }
}

export const scanService = new GlobalRef(
  "scanService",
  () => new ScanService(rabbitMQRPCClient, prisma)
).value;
