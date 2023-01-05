import { Model } from "mongoose";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { IDomain, INetwork, IReport } from "../types";

const keys = Object.keys(InspectionTypeEnum);

const getTotals = async (
  isAdmin: boolean,
  networks: INetwork[],
  domain: Model<IDomain>
): Promise<{ uniqueDomains: number; ipAddresses: number; dns: number }> => {
  if (!isAdmin && networks.length === 0) {
    return {
      uniqueDomains: 0,
      ipAddresses: 0,
      dns: 0,
    };
  }

  const [uniqueDomains, ipAddresses, dns] = await Promise.all([
    domain
      .distinct("fqdn", {
        ...(isAdmin
          ? {}
          : {
              $or: networks.map((network) => ({
                ipV4AddressNumber: {
                  $gte: +network.startAddressNumber,
                  $lte: +network.endAddressNumber,
                },
              })),
            }),
      })
      .lean(),
    domain
      .distinct("ipV4AddressNumber", {
        ...(isAdmin
          ? {}
          : {
              $or: networks.map((network) => ({
                ipV4AddressNumber: {
                  $gte: +network.startAddressNumber,
                  $lte: +network.endAddressNumber,
                },
              })),
            }),
      })
      .lean(),
    domain.countDocuments().lean(),
  ]);

  return {
    uniqueDomains: uniqueDomains.length,
    ipAddresses: ipAddresses.length,
    dns: dns,
  };
};

const getCurrentStatePercentage = async (
  isAdmin: boolean,
  networks: INetwork[],
  domain: Model<IDomain>
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  if (!isAdmin && networks.length === 0) {
    return {
      totalCount: 0,
      data: keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}) as any,
    };
  }

  // get all domains of the network
  const [res] = (await domain.aggregate([
    ...(isAdmin
      ? []
      : [
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
        ]),
    {
      $match: {
        $or: [
          {
            errorCount: {
              $eq: null,
            },
          },
          {
            errorCount: {
              $eq: 0,
            },
          },
        ],
      },
    },
    {
      $facet: {
        totalCount: [{ $count: "total" }],
        data: [
          {
            $group: {
              _id: null,
              ...keys
                .map((key) => ({
                  [key]: {
                    $sum: {
                      $cond: [`$${key}`, 1, 0],
                    },
                  },
                }))
                .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    },
  ])) as any;
  return {
    totalCount: res.totalCount[0]?.total ?? 0,
    data: res.data[0] ?? {
      ...keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}),
    },
  };
};
const getFailedSuccessPercentage = async (
  isAdmin: boolean,
  networks: INetwork[],
  report: Model<IReport>,
  timeQuery?: { start: number; end: number }
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  if (!isAdmin && networks.length === 0) {
    return {
      totalCount: 0,
      data: keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}) as any,
    };
  }

  // get all domains of the network
  const [res] = (await report.aggregate([
    ...(isAdmin
      ? []
      : [
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
        ]),
    ...(timeQuery
      ? [
          {
            $match: {
              validFrom: {
                $lte: timeQuery.end,
              },
            },
          },
        ]
      : []),
    {
      $group: {
        _id: "$fqdn",
        report: { $last: "$result" },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$report",
      },
    },
    {
      $project: keys
        .map((key) => ({
          [key]: `$${key}.didPass`,
        }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    },
    {
      $facet: {
        totalCount: [{ $count: "total" }],
        data: [
          {
            $group: {
              _id: null,
              ...keys
                .map((key) => ({
                  [key]: {
                    $sum: {
                      $cond: [`$${key}`, 1, 0],
                    },
                  },
                }))
                .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    },
  ])) as any;
  return {
    totalCount: res.totalCount[0]?.total ?? 0,
    data: res.data[0] ?? {
      ...keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}),
    },
  };
};

export const statService = {
  getTotals,
  getCurrentStatePercentage,
  getFailedSuccessPercentage,
};
