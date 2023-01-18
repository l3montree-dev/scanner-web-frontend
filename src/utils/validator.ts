import ip from "ip";

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const isValidIp = (ipAddress: string): boolean => {
  return ip.isV4Format(ipAddress);
};

export const isValidMask = (mask: string): boolean => {
  const prefixLength = parseInt(mask);
  return prefixLength >= 0 && prefixLength <= 32;
};
