export interface InspectResult {}

export interface ResponseInspector {
  inspect(response: Response): Array<InspectResult | Promise<InspectResult>>;
}

export interface UrlInspector {
  inspect(url: URL): Array<InspectResult> | Promise<Array<InspectResult>>;
}
