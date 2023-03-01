import "isomorphic-fetch";

jest.mock("next/router", () => require("next-router-mock"));
jest.mock("next-auth");

Object.defineProperty(global.self, "crypto", {
  value: {
    randomUUID: () => "00000000-0000-0000-0000-000000000000",
  },
});

export {};
