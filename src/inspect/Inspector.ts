export enum InspectionType {
  HTTP,
  HTTP_308,
  HTTP_LocationHttps,
  HTTPS,
}

export interface InspectResultDTO {
  type: InspectionType;
  didPass: boolean;
  subResults?: InspectResultDTO[];
}

export class InspectResult {
  type: InspectionType;
  didPass: boolean;
  subResults?: Array<InspectResult>;

  constructor(
    type: InspectionType,
    didPass: undefined,
    subResults: Array<InspectResult>
  );
  constructor(type: InspectionType, didPass: boolean);
  constructor(
    type: InspectionType,
    didPass?: boolean,
    subResults?: Array<InspectResult>
  ) {
    this.type = type;
    this.didPass = Boolean(
      didPass || subResults?.every((subResult) => subResult.didPass)
    );
    this.subResults = subResults;
  }

  toDTO(): InspectResultDTO {
    return {
      type: this.type,
      didPass: this.didPass,
      subResults: this.subResults?.map((subResult) => subResult.toDTO()),
    };
  }
}

export interface InspectResult {}

export interface ResponseInspector {
  inspect(response: Response): Promise<InspectResult>;
}

export abstract class UrlInspector {
  // simplifies testing since we can inject our own http client.
  constructor(protected readonly httpClient: typeof fetch) {}

  abstract inspect(hostname: string): Promise<InspectResult[]>;
}
