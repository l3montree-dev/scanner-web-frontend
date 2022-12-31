import ip from "ip";
import { Model } from "mongoose";
import {
  IDomain,
  INetwork,
  IReport,
  IScanErrorResponse,
  PaginateRequest,
  PaginateResult,
} from "../types";
import { jsonSerializableStage } from "../utils/dbUtils";
// only create a new report if the didPass property changed.
export const handleNewDomain = async (
  domain: { fqdn: string; ipV4Address: string },
  model: Model<IDomain>
): Promise<{ fqdn: string }> => {
  // fetch the last existing report and check if we only need to update that one.
  let payload = {
    fqdn: domain.fqdn,
    ipV4Address: domain.ipV4Address,
    ipV4AddressNumber: ip.toLong(domain.ipV4Address),
  };
  try {
    await model.create(payload);
  } catch (e) {
    // probably unique key index error
  }
  return payload;
};

export const handleNewFQDN = async (
  fqdn: string,
  ipAddress: string,
  model: Model<IDomain>
): Promise<{ fqdn: string }> => {
  let payload = {
    fqdn: fqdn,
    ipV4Address: ipAddress,
    ipV4AddressNumber: ip.toLong(ipAddress),
  };
  try {
    await model.create(payload);
  } catch (e) {
    // probably unique key index error
  }
  return payload;
};

export const handleDomainScanError = async (
  content: IScanErrorResponse,
  domain: Model<IDomain>
) => {
  const ipV4AddressNumber = ip.toLong(content.ipAddress);

  const res = await domain
    .updateOne(
      {
        fqdn: content.fqdn,
        ipV4AddressNumber,
      },
      {
        lastScan: content.timestamp ?? Date.now(),
        queued: false,
        // increment the error count property by 1
        $inc: { errorCount: 1 },
      },
      {
        new: true,
        upsert: true,
      }
    )
    .lean();
  return res;
};

export const getDomainsOfNetworksWithLatestTestResult = async (
  isAdmin: boolean,
  networks: INetwork[],
  paginateRequest: PaginateRequest & { search?: string },
  domain: Model<IDomain>
): Promise<PaginateResult<IDomain & { report?: IReport }>> => {
  // get all domains of the network
  const [domains] = (await domain.aggregate([
    ...(paginateRequest.search
      ? [
          {
            $match: {
              fqdn: {
                $regex: paginateRequest.search,
                $options: "i",
              },
            },
          },
        ]
      : []),
    ...(!isAdmin
      ? [
          {
            $match: {
              $or: networks.map((network) => ({
                ipV4AddressNumber: {
                  $gte: +network.startAddressNumber,
                  $lte: +network.endAddressNumber,
                },
              })),
            },
          },
        ]
      : []),
    {
      $facet: {
        data: [
          {
            $sort: {
              fqdn: 1,
            },
          },
          { $skip: paginateRequest.page * paginateRequest.pageSize },
          { $limit: paginateRequest.pageSize },

          {
            $lookup: {
              from: "reports",
              localField: "fqdn",
              foreignField: "fqdn",
              as: "report",
              pipeline: [
                {
                  $sort: {
                    lastScan: -1,
                  },
                },
                { $limit: 1 },
                ...jsonSerializableStage,
              ],
            },
          },
          {
            $unwind: {
              path: "$report",
              preserveNullAndEmptyArrays: true,
            },
          },
          ...jsonSerializableStage,
        ],
        totalCount: [{ $count: "total" }],
      },
    },
  ])) as any;

  return {
    total: domains.totalCount.length === 1 ? domains.totalCount[0].total : 0,
    page: paginateRequest.page,
    pageSize: paginateRequest.pageSize,
    data: domains.data,
  };
};

export const getDomains2Scan = async (domain: Model<IDomain>) => {
  // get all domains which have not been scanned in the last 24 hours
  const domains = await domain
    .find({
      $and: [
        {
          $or: [
            {
              errorCount: {
                $eq: null,
              },
            },
            {
              errorCount: {
                $lt: 5,
              },
            },
          ],
        },
        {
          $or: [
            {
              lastScan: {
                $eq: null,
              },
            },
            {
              lastScan: {
                $lt: new Date(
                  new Date().getTime() -
                    +(process.env.SCAN_INTERVAL_DAYS ?? 7) * 24 * 60 * 60 * 1000
                ).getTime(),
              },
            },
          ],
        },
      ],
      queued: {
        $ne: true,
      },
    })
    .sort({
      lastScan: 1,
    })
    // limit to 1000 domains - this is to prevent the service from overloading the memory
    .limit(1000)
    .lean();

  // mark all domains as queued.
  await domain.updateMany(
    {
      _id: {
        $in: domains.map((domain) => domain._id),
      },
    },
    {
      queued: true,
    }
  );
  return domains;
};
