export default class TestHeaderResponse {
  headers: Record<string, string>;
  constructor(headers: Record<string, string>) {
    // transform all to lowercase.
    this.headers = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
    );
  }

  get(headerName: string): string | null {
    const header = this.headers[headerName.toLowerCase()];
    if (header) {
      return header;
    }
    return null;
  }
  has(headerName: string): boolean {
    return !!this.headers[headerName.toLowerCase()];
  }
}
