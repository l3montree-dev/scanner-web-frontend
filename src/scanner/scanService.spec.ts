import { ScanService } from "./scanService";

jest.mock("next-auth", () => ({}));
jest.mock("next-auth/jwt", () => ({}));
jest.mock("../app/api/auth/[...nextauth]/route", () => ({}));
jest.mock("../db/connection", () => ({
  prisma: {},
}));

describe("ScanService test suite", () => {
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

    // it would throw an error if there is no scan already since we are
    // trying to call a method on the empty object (MessageBrokerClient)
    const sut = new ScanService({} as any, prismaMock as any);
    const [result] = await sut.scanTargetRPC("", existing.target.uri, {
      refreshCache: false,
      startTimeMS: Date.now(),
    });

    expect(result.result).toEqual({
      dnsSec: {
        didPass: true,
      },
    });
  });

  it("should return the scan report, even if there is an error during the database handling", async () => {
    const msgBrokerClientMock = {
      call: jest.fn().mockResolvedValue({
        target: "example.com",
        timestamp: Date.now(),
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      }),
    };

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
    const sut = new ScanService(msgBrokerClientMock as any, prismaMock as any);
    const [res] = await sut.scanTargetRPC("", "example.com", {
      refreshCache: false,
      startTimeMS: Date.now(),
    });

    expect(res.result).toEqual(
      expect.objectContaining({
        dnsSec: {
          didPass: true,
        },
      })
    );
  });
  it("should return the new scan report if the scan was successful", async () => {
    const msgBrokerClientMock = {
      call: jest.fn().mockResolvedValue({
        target: "example.com",
        timestamp: Date.now(),
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      }),
    };

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

    const sut = new ScanService(msgBrokerClientMock as any, prismaMock as any);
    const [res] = await sut.scanTargetRPC("", "example.com", {
      refreshCache: false,
      startTimeMS: Date.now(),
    });

    expect(res.result).toEqual(
      expect.objectContaining({
        dnsSec: {
          didPass: true,
        },
      })
    );
  });

  it("should save the new scan report inside the database if the scan was successful", async () => {
    const msgBrokerClientMock = {
      call: jest.fn().mockResolvedValue({
        target: "example.com",
        result: {
          details: {
            dnsSec: {
              didPass: true,
            },
          },
        },
      }),
    };

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
    await new ScanService(
      msgBrokerClientMock as any,
      prismaMock as any
    ).scanTargetRPC("", "example.com", {
      refreshCache: false,
      startTimeMS: Date.now(),
    });

    expect(prismaMock.scanReport.create).toHaveBeenCalled();
  });

  describe("after scan", () => {
    it("should issue a scan if the site is valid and there is no scan already existing", async () => {
      const msgBrokerClientMock = {
        call: jest.fn().mockResolvedValue({
          target: "example.com",
          result: {},
        }),
      };

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

      await new ScanService(
        msgBrokerClientMock as any,
        prismaMock as any
      ).scanTargetRPC("", "example.com", {
        refreshCache: false,
        startTimeMS: Date.now(),
      });

      expect(msgBrokerClientMock.call).toHaveBeenCalled();
    });
    it("should issue a scan if the refresh query parameter is set to true", async () => {
      const msgBrokerClientMock = {
        call: jest.fn().mockResolvedValue({
          target: "example.com",
          result: {},
        }),
      };

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

      await new ScanService(
        msgBrokerClientMock as any,
        prismaMock as any
      ).scanTargetRPC("", "example.com", {
        refreshCache: true,
        startTimeMS: Date.now(),
      });

      expect(msgBrokerClientMock.call).toHaveBeenCalled();
    });
  });
});
