import { DEFAULT_MIN_VERSION, SecureVersion } from "node:tls";
import { openSSL } from "../../services/openssl";
import { promise2Boolean } from "../../utils/promise";
import { tlsConnect } from "../../utils/tls";

import { InspectionResult, TLSInspectionType } from "../Inspector";

const tlsVersionSupported = async (fqdn: string, tlsVersion: SecureVersion) => {
  try {
    const socket = await tlsConnect({
      port: 443,
      host: fqdn,
      servername: fqdn,
      maxVersion: tlsVersion,
      minVersion: tlsVersion,
      rejectUnauthorized: false,
    });
    // close the connection
    socket.destroy();
    return true;
  } catch (e) {
    console.log(tlsVersion, e, DEFAULT_MIN_VERSION);
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
    await promise2Boolean(
      openSSL(["s_client", "-connect", `${fqdn}:443`, "-tls1_1"])
    ),
    await promise2Boolean(
      openSSL(["s_client", "-connect", `${fqdn}:443`, "-tls1"])
    ),
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

export const sslDeactivatedChecker = async (fqdn: string) => {
  // use openSSL process wrapper, since the openssl version linked to nodejs does not support ssl3 anymore.
  try {
    const res = await openSSL(["s_client", "-connect", `${fqdn}:443`, "-ssl3"]);
    return new InspectionResult(TLSInspectionType.SSLDeactivated, false, {
      res,
    });
  } catch (e) {
    return new InspectionResult(TLSInspectionType.SSLDeactivated, true, {});
  }
};
