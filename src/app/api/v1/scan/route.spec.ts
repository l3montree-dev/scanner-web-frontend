import { NextResponse } from "next/server";
import * as db from "../../../../db/connection";
import { ISession } from "../../../../types";
import { getServerSession } from "../../../../utils/server";
import { staticSecrets } from "../../../../utils/staticSecrets";
import { GET } from "./route";

jest.mock("next-auth", () => ({}));
jest.mock("next-auth/jwt", () => ({}));
jest.mock("../auth/[...nextauth]/route", () => ({}));
jest.mock("../../../db/connection", () => ({
  prisma: {},
}));

const getServerSessionMock = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

jest.mock("../../../utils/server", () => ({
  ...jest.requireActual("../../../utils/server"),
  getServerSession: jest.fn(),
}));

NextResponse.json = jest.fn(
  (obj, responseInit?: ResponseInit) =>
    ({
      json: () => obj,
      status: responseInit?.status ?? 200,
    } as any)
);

describe("Scan API Test Suite", () => {
  it("should return a 403 error if the secret is invalid and the user is not logged in", async () => {
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: "invalid" }),
      },
      headers: new Headers({}),
    } as any);
    expect(res.status).toEqual(401);
  });
  it("should not require a secret if the user is logged in", async () => {
    getServerSessionMock.mockResolvedValue({} as ISession);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: "invalid" }),
      },
      headers: new Headers({}),
    } as any);
    // should be 400 since we did not provide any site
    expect(res.status).toEqual(400);
  });
  it("should return a 400 error if the site is not provided", async () => {
    getServerSessionMock.mockResolvedValue({} as ISession);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: Object.keys(staticSecrets)[0] }),
      },
      headers: new Headers({}),
    } as any);
    expect(res.status).toEqual(400);
  });
  it("should return a 400 error if the site is not valid", async () => {
    getServerSessionMock.mockResolvedValue({} as ISession);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({
          site: "invalid",
          s: Object.keys(staticSecrets)[0],
        }),
      },
      headers: new Headers({}),
    } as any);
    expect(res.status).toEqual(400);
  });
  it("should check in the database if there is a scan already existing", async () => {
    const existing = {
      target: {
        uri: "https://example.com",
      },
      details: {
        dnsSec: {
          didPass: true,
        },
      },
    };
    const prismaMock = {
      lastScanDetails: {
        findFirst: jest.fn().mockResolvedValue(existing), // there is a scan already
      },
    };

    // @ts-expect-error
    db.default.prisma = prismaMock as any;

    getServerSessionMock.mockResolvedValue({} as ISession);

    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({
          s: Object.keys(staticSecrets)[0],
          site: "example.com",
        }),
      },
      headers: new Headers({}),
    } as any);
    expect(res.status).toEqual(200);
    expect(await res.json()).toEqual({
      uri: "https://example.com",
      details: {
        dnsSec: {
          didPass: true,
        },
      },
    });
  });
  describe("after scan", () => {
    let rabbitMQRPCClient: any;
    beforeEach(() => {
      const mock = jest.requireMock("../../../services/rabbitmqClient");
      rabbitMQRPCClient = mock.rabbitMQRPCClient;
    });
    it("should issue a scan if the site is valid and there is no scan already existing", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        result: {},
      });

      const prismaMock = {
        target: {
          upsert: jest.fn().mockResolvedValue({
            uri: "example.com",
          }),
        },
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue(null), // there is no scan already
        },
      };

      // @ts-expect-error
      db.default.prisma = prismaMock as any;
      getServerSessionMock.mockResolvedValue({} as ISession);

      await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
        headers: new Headers({}),
      } as any);
      expect(rabbitMQRPCClient.call).toHaveBeenCalled();
    });
    it("should issue a scan if the refresh query parameter is set to true", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        result: {},
      });

      const prismaMock = {
        target: {
          upsert: jest.fn().mockResolvedValue({
            uri: "example.com",
          }),
        },
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue({}), // there is a scan already
        },
      };
      // @ts-expect-error
      db.default.prisma = prismaMock as any;

      getServerSessionMock.mockResolvedValue({} as ISession);

      await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
            refresh: "true",
          }),
        },
        headers: new Headers({}),
      } as any);
      expect(rabbitMQRPCClient.call).toHaveBeenCalled();
    });
    it("should save the new scan report inside the database if the scan was successful", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        result: {
          details: {
            dnsSec: {
              didPass: true,
            },
          },
        },
      });

      const prismaMock = {
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue(null), // there is no scan already
        },
        target: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };

      // @ts-expect-error
      db.default.prisma = prismaMock as any;

      getServerSessionMock.mockResolvedValue({} as ISession);

      await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
        headers: new Headers({}),
      } as any);
      expect(prismaMock.scanReport.create).toHaveBeenCalled();
    });
    it("should return the new scan report if the scan was successful", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        timestamp: Date.now(),
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      });

      const prismaMock = {
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue(null), // there is no scan already
        },
        target: {
          upsert: jest.fn().mockResolvedValue({
            uri: "example.com",
          }),
        },
      };
      // @ts-expect-error
      db.default.prisma = prismaMock as any;
      getServerSessionMock.mockResolvedValue({} as ISession);

      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
        headers: new Headers({}),
      } as any);

      expect(await res.json()).toEqual(
        expect.objectContaining({
          uri: "example.com",
          details: {
            dnsSec: {
              didPass: true,
            },
            sut: "example.com",
          },
        })
      );
    });

    it("should return the scan report, even if there is an error during the database handling", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        timestamp: Date.now(),
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      });

      const prismaMock = {
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockRejectedValue(new Error("error")),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue(null), // there is no scan already
        },
        target: {
          upsert: jest.fn().mockResolvedValue({
            uri: "example.com",
          }),
        },
      };
      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));
      getServerSessionMock.mockResolvedValue({} as ISession);
      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
        headers: new Headers({}),
      } as any);

      expect(await res.json()).toEqual(
        expect.objectContaining({
          uri: "example.com",
          details: {
            dnsSec: {
              didPass: true,
            },
            sut: "example.com",
          },
        })
      );
    });

    it("should return a 422 status code, if the scan was not successful -> the dns failed", async () => {
      rabbitMQRPCClient.call.mockResolvedValue({
        target: "example.com",
        timestamp: Date.now(),
        result: {
          error: "",
        },
      });

      const prismaMock = {
        scanReport: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
        },
        lastScanDetails: {
          findFirst: jest.fn().mockResolvedValue(null), // there is no scan already
        },
        target: {
          upsert: jest.fn().mockResolvedValue({
            uri: "example.com",
          }),
        },
      };
      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));
      getServerSessionMock.mockResolvedValue({} as ISession);

      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
        headers: new Headers({}),
      } as any);
      expect(res.status).toEqual(422);
    });
  });
});
