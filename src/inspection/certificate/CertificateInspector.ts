import {
  CertificateInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

export default class CertificateInspector
  implements Inspector<CertificateInspectionType>
{
  inspect(
    hostname: string
  ): Promise<{ [key in CertificateInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
