export default class TestBodyResponse {
  constructor(private data: any, public status = 200) {}
  async text() {
    return this.data;
  }

  async json() {
    return this.data;
  }
}
