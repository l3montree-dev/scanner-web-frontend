import { Model } from "mongoose";
import {
  HttpInspectionType,
  InspectionType,
  InspectionTypeEnum,
} from "../inspection/scans";
import { IDomain, INetwork, IReport, PaginateResult } from "../types";

const keys = Object.keys(InspectionTypeEnum);

export const getFailedSuccessPercentage = async (
  networks: INetwork[],
  report: Model<IReport>
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  // get all domains of the network
  const [res] = (await report.aggregate([
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
