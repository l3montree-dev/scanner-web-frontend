import {
  CertificateInspectionType,
  ContentInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

export default class ContentInspector
  implements Inspector<ContentInspectionType>
{
  inspect(
    fqdn: string
  ): Promise<{ [key in ContentInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
