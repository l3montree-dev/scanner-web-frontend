import {
  CertificateInspectionType,
  ContentInspectionType,
  DomainInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

export default class DomainInspector
  implements Inspector<DomainInspectionType>
{
  inspect(
    hostname: string
  ): Promise<{ [key in DomainInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
