import { resolve4 } from "dns/promises";
import ip from "ip";
import { Model } from "mongoose";
import { IDomain, INetwork } from "../types";
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

export const getAllDomainsOfNetwork = async (
  network: INetwork,
  domain: Model<IDomain>
) => {
  // get all domains of the network
  const domains = await domain
    .find({
      ipV4AddressNumber: {
        $gte: network.startAddressNumber,
        $lte: network.endAddressNumber,
      },
    })
    .lean();
  return domains;
};
