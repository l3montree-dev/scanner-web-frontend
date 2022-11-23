const httpOnlySites = ["bsi.bund.de"];
export const resolveProtocol = (fqdn: string) => {
  if (httpOnlySites.includes(fqdn)) {
    return "https";
  }
  // following the redirect should suit most cases.
  return "http";
};
