import { DEFAULT_MIN_VERSION, SecureVersion } from "node:tls";
import {
  isSSL3Supported,
  isTLS11Supported,
  isTLS1Supported,
} from "../../services/openssl";
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
  // we can only check for TLSv1.1 support using the prebuild openssl binary.
  const [tls11Supported, tls10Supported] = await Promise.all([
    isTLS11Supported(fqdn),
    isTLS1Supported(fqdn),
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
  const ssl3Supported = await isSSL3Supported(fqdn);
  return new InspectionResult(
    TLSInspectionType.SSLDeactivated,
    !ssl3Supported,
    {}
  );
};
