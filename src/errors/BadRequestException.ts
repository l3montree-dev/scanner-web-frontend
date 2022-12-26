import HttpError from "./HttpError";

export default class BadRequestException extends HttpError {
  constructor() {
    super("BadRequestException", 400, "Bad Request");
  }
}
