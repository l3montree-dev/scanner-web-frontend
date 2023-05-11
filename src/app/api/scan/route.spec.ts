import * as serverUtils from "../../../utils/server";
import { staticSecrets } from "../../../utils/staticSecrets";

import { GET } from "./route";

jest.mock("next-auth", () => ({}));
jest.mock("../auth/[...nextauth]/route", () => ({}));
jest.mock("../../../db/connection", () => ({}));

describe("Scan API Test Suite", () => {
  it("should return a 403 error if the secret is invalid and the user is not logged in", async () => {
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: "invalid" }),
      },
    } as any);
    expect(res.status).toEqual(403);
  });
  it("should not require a secret if the user is logged in", async () => {
    jest
      .spyOn(serverUtils, "getServerSession")
      .mockResolvedValueOnce({} as any);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: "invalid" }),
      },
    } as any);
    // should be 400 since we did not provide any site
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it("should return a 400 error if the site is not provided", async () => {
    jest
      .spyOn(serverUtils, "getServerSession")
      .mockResolvedValueOnce({} as any);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({ s: Object.keys(staticSecrets)[0] }),
      },
    } as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it("should return a 400 error if the site is not valid", async () => {
    jest
      .spyOn(serverUtils, "getServerSession")
      .mockResolvedValueOnce({} as any);
    const res = await GET({
      nextUrl: {
        searchParams: new URLSearchParams({
          site: "invalid",
          s: Object.keys(staticSecrets)[0],
        }),
      },
    } as any);
    expect(res.status).toHaveBeenCalledWith(400);
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

    jest.mock("../../../db/connection", () => ({
      prisma: prismaMock,
    }));

    const res = await GET({
      query: {
        s: Object.keys(staticSecrets)[0],
        site: "example.com",
      },
      headers: {},
    } as any);
    expect(res.status).toHaveBeenCalledWith(200);
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
      const mock = jest.requireMock("../../services/rabbitmqClient");
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

      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));

      await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
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

      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));

      await GET({
        query: {
          s: staticSecrets[Object.keys(staticSecrets)[0]],
          site: "example.com",
          refresh: "true",
        },
        headers: {},
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

      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));

      await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
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
      jest.mock("../../../db/connection", () => ({
        prisma: prismaMock,
      }));

      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
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

      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
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
      const res = await GET({
        nextUrl: {
          searchParams: new URLSearchParams({
            s: Object.keys(staticSecrets)[0],
            site: "example.com",
          }),
        },
      } as any);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
