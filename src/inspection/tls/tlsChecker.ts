import { SecureVersion } from "node:tls";

import { getLogger } from "../../utils/logger";
import { InspectionResult, TLSInspectionType } from "../Inspector";
import { tlsConnect } from "./connection";

const logger = getLogger(__filename);

const tlsVersionSupported = async (fqdn: string, tlsVersion: SecureVersion) => {
  try {
    const socket = await tlsConnect({
      port: 443,
      host: fqdn,
      servername: fqdn,
      maxVersion: tlsVersion,
      minVersion: tlsVersion,
    });
    // close the connection
    socket.destroy();
    return true;
  } catch (e) {
    return false;
  }
};
// 'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`
export const tls12Supported = async (fqdn: string) => {
  return new InspectionResult(
    TLSInspectionType.TLSv1_2,
    await tlsVersionSupported(fqdn, "TLSv1.2"),
    {}
  );
};

export const tls13Supported = async (fqdn: string) => {
  return new InspectionResult(
    TLSInspectionType.TLSv1_3,
    await tlsVersionSupported(fqdn, "TLSv1.3"),
    {}
  );
};

export const tls11NotSupported = async (fqdn: string) => {
  const [tls11Supported, tls10Supported] = await Promise.all([
    tlsVersionSupported(fqdn, "TLSv1.1"),
    tlsVersionSupported(fqdn, "TLSv1"),
  ]);
  return new InspectionResult(
    TLSInspectionType.TLSv1_1_Deactivated,
    !tls11Supported && !tls10Supported,
    {
      tls11Supported,
      tls10Supported,
    }
  );
};
