import {
  InspectionResult,
  OrganizationalInspectionType,
  Inspector,
} from "../Inspector";

export default class OrganizationalInspector
  implements Inspector<OrganizationalInspectionType>
{
  inspect(
    hostname: string
  ): Promise<{ [key in OrganizationalInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
