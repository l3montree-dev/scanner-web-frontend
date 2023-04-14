import { buildResponseMock } from "../../test-utils/factories";
import { staticSecrets } from "../../utils/staticSecrets";

import { handler } from "./scan.api";

jest.mock("next-auth", () => ({}));
jest.mock("../api/auth/[...nextauth].api", () => ({}));

describe("Scan API Test Suite", () => {
  it("should return a 403 error if the secret is invalid and the user is not logged in", async () => {
    const resMock = buildResponseMock();
    await handler(
      {
        query: {
          s: "invalid",
        },
      } as any,
      resMock as any,
      [{} as any, null]
    );
    expect(resMock.status).toHaveBeenCalledWith(403);
  });
  it("should not require a secret if the user is logged in", async () => {
    const resMock = buildResponseMock();
    await handler(
      {
        query: {
          s: "invalid",
        },
        headers: {},
      } as any,
      resMock as any,
      [{} as any, {} as any]
    );
    // should be 400 since we did not provide any site
    expect(resMock.status).toHaveBeenCalledWith(400);
  });
  it("should return a 400 error if the site is not provided", async () => {
    const resMock = buildResponseMock();
    await handler(
      {
        query: {
          s: staticSecrets[Object.keys(staticSecrets)[0]],
        },
        headers: {},
      } as any,
      resMock as any,
      [{} as any, null]
    );
    expect(resMock.status).toHaveBeenCalledWith(400);
  });
  it("should return a 400 error if the site is not valid", async () => {
    const resMock = buildResponseMock();
    await handler(
      {
        query: {
          s: staticSecrets[Object.keys(staticSecrets)[0]],
          site: "invalid",
        },
        headers: {},
      } as any,
      resMock as any,
      [{} as any, null]
    );
    expect(resMock.status).toHaveBeenCalledWith(400);
  });
  it("should check in the database if there is a scan already existing", async () => {
    const resMock = buildResponseMock();

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
    await handler(
      {
        query: {
          s: staticSecrets[Object.keys(staticSecrets)[0]],
          site: "example.com",
        },
        headers: {},
      } as any,
      resMock as any,
      [prismaMock as any, null]
    );
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
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
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );
      expect(rabbitMQRPCClient.call).toHaveBeenCalled();
    });
    it("should issue a scan if the refresh query parameter is set to true", async () => {
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
            refresh: "true",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );
      expect(rabbitMQRPCClient.call).toHaveBeenCalled();
    });
    it("should save the new scan report inside the database if the scan was successful", async () => {
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );
      expect(prismaMock.scanReport.create).toHaveBeenCalled();
    });
    it("should return the new scan report if the scan was successful", async () => {
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );

      expect(resMock.json).toHaveBeenCalledWith(
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
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );
      expect(resMock.json).toHaveBeenCalledWith(
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
      const resMock = buildResponseMock();

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
      await handler(
        {
          query: {
            s: staticSecrets[Object.keys(staticSecrets)[0]],
            site: "example.com",
          },
          headers: {},
        } as any,
        resMock as any,
        [prismaMock as any, null]
      );
      expect(resMock.status).toHaveBeenCalledWith(422);
    });
  });
});
