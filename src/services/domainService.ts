import { resolve4 } from "dns/promises";
import ip from "ip";
import { Model } from "mongoose";
import {
  IDomain,
  INetwork,
  IReport,
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
  model: Model<IDomain>
): Promise<{ fqdn: string }> => {
  // resolve v4
  const [ipAddress] = await resolve4(fqdn);
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

export const getDomainsOfNetworksWithLatestTestResult = async (
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
    {
      $match: {
        $or: networks.map((network) => ({
          ipV4AddressNumber: {
            $gte: network.startAddressNumber,
            $lte: network.endAddressNumber,
          },
        })),
      },
    },
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
    total: domains.totalCount[0].total,
    page: paginateRequest.page,
    pageSize: paginateRequest.pageSize,
    data: domains.data,
  };
};
