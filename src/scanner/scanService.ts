import { PrismaClient, Target } from "@prisma/client";
import { prisma } from "../db/connection";
import { GlobalRef } from "../services/globalRef";
import { getLogger } from "../services/logger";
import { rabbitMQRPCClient } from "../services/rabbitmqClient";
import {
  reportService,
  scanResult2TargetDetails,
} from "../services/reportService";
import { targetService } from "../services/targetService";
import {
  DetailedTarget,
  DetailsJSON,
  IScanErrorResponse,
  IScanResponse,
  IScanSuccessResponse,
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
  ): Promise<IScanResponse> {
    const result = await this.messageBrokerClient.call<IScanResponse>(
      process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
      {
        target,
        refresh: options.refreshCache, // if refresh is true, it will bypass all caching layers,
        socks5Proxy: options.socks5Proxy,
      },
      { messageId: requestId }
    );

    return result;
  }

  public async handleScanResponse(
    requestId: string,
    response: IScanResponse,
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
          uri: response.target,
          lastScan: response.timestamp,
          hostname: "",
          errorCount: 0,
          number: 0,
          queued: false,
          createdAt: new Date(response.timestamp).toString(),
          updatedAt: new Date(response.timestamp).toString(),
          details: scanResult2TargetDetails(response),
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
    | [IScanSuccessResponse, DTO<DetailedTarget>]
    | [IScanErrorResponse, undefined]
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
        return [
          {
            target: target.uri,
            result: rest.details as IScanSuccessResponse["result"],
            duration: 0,
            ipAddress: "",
            sut: rest.details.sut,
            timestamp: target.lastScan,
          },
          { ...target, details: rest.details },
        ];
      } else {
        logger.info(
          { requestId },
          `no existing report for site: ${sanitizedURI} - starting new scan`
        );
      }
    }
    const result = await this.scanRPC(requestId, sanitizedURI, options);

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
          uri: result.target,
          lastScan: result.timestamp,
          hostname: "",
          errorCount: 0,
          number: 0,
          queued: false,
          createdAt: new Date(result.timestamp).toString(),
          updatedAt: new Date(result.timestamp).toString(),
          details: scanResult2TargetDetails(result),
        }
      );
    }
    return [result, detailedTarget] as
      | [IScanSuccessResponse, DTO<DetailedTarget>]
      | [IScanErrorResponse, undefined];
  }
}

export const scanService = new GlobalRef(
  "scanService",
  () => new ScanService(rabbitMQRPCClient, prisma)
).value;
