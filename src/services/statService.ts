import { Model } from "mongoose";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { INetwork, IReport } from "../types";

const keys = Object.keys(InspectionTypeEnum);

export const getFailedSuccessPercentage = async (
  isAdmin: boolean,
  networks: INetwork[],
  report: Model<IReport>
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
    data: res.data[0],
  };
};
