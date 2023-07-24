import { config } from "../config";
import { scanService } from "../scanner/scanService";
import { reportService } from "./reportService";

jest.mock("next-auth", () => ({}));
jest.mock("next-auth/jwt", () => ({}));

describe("Report Service Test Suite", () => {
  it("should not create a new scan report if the reports did not change", async () => {
    const prismaMock = {
      scanReport: {
        findMany: jest.fn(() => [
          {
            dnsSec: true,
          },
        ]),
        create: jest.fn(),
      },
      target: {
        update: jest.fn(),
      },
      lastScanDetails: {
        findFirst: jest.fn(),
      },
    };
    jest.mock("../db/connection", () => ({
      prisma: prismaMock,
    }));

    await reportService.handleNewScanReport(
      "",
      {
        target: "example.com",
        timestamp: 4711,
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      } as any,
      prismaMock as any,
      {
        refreshCache: false,
        startTimeMS: Date.now(),
      }
    );

    // it should not create a new scan report.
    expect(prismaMock.scanReport.create).not.toHaveBeenCalled();
    expect(prismaMock.target.update).toHaveBeenCalledWith({
      where: { uri: "example.com" },
      data: {
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        hostname: "example.com",
      },
    });
  });

  it("should not create a new scan report if the change could not be validated", async () => {
    const prismaMock = {
      scanReport: {
        findMany: jest.fn(() => [
          {
            dnsSec: true,
          },
        ]),
        create: jest.fn(),
      },
      target: {
        update: jest.fn(),
      },
      lastScanDetails: {
        findFirst: jest.fn(),
      },
    };
    jest.mock("../db/connection", () => ({
      prisma: prismaMock,
    }));

    config.socks5Proxy = "socks5://localhost:9050";
    const scanRPCValidation = jest
      .spyOn(scanService, "scanRPC")
      .mockResolvedValue({
        target: "example.com",
        timestamp: 11,
        result: {
          dnsSec: {
            didPass: true, // we are validating a change - dnsSec did still pass
          },
        },
      } as any);

    await reportService.handleNewScanReport(
      "",
      {
        target: "example.com",
        timestamp: 4711,
        result: {
          dnsSec: {
            didPass: false,
          },
        },
      } as any,
      prismaMock as any,
      {
        refreshCache: false,
        startTimeMS: Date.now(),
      }
    );
    // remove the config again
    config.socks5Proxy = undefined;

    expect(scanRPCValidation).toHaveBeenCalled();
    // it should not create a new scan report.
    expect(prismaMock.scanReport.create).not.toHaveBeenCalled();
    expect(prismaMock.target.update).toHaveBeenCalledWith({
      where: { uri: "example.com" },
      data: {
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        hostname: "example.com",
      },
    });
  });

  it.each([
    {
      event: "change",
      reports: [
        {
          dnsSec: false,
        },
      ],
    },
    {
      event: "not exist",
      reports: [],
    },
  ])(
    "should create a new scan report if the reports did %s (no validation)",
    async ({ reports }) => {
      const target = {
        uri: "example.com/test",
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        // make sure the hostname is set correctly.
        hostname: "example.com",
      };

      const prismaMock = {
        scanReport: {
          create: jest.fn(),
          findMany: jest.fn(() => reports),
        },
        target: {
          upsert: jest.fn(() => target),
        },
        lastScanDetails: {
          findFirst: jest.fn(),
        },
      };

      await reportService.handleNewScanReport(
        "",
        {
          target: "example.com/test",
          timestamp: 4711,
          result: {
            dnsSec: {
              didPass: true,
            },
          },
        } as any,
        prismaMock as any,
        {
          refreshCache: false,
          startTimeMS: Date.now(),
        }
      );

      const lastScanDetails = {
        details: expect.objectContaining({
          sut: "example.com/test",
          dnsSec: {
            didPass: true,
          },
        }),
      };

      expect(prismaMock.scanReport.create).toHaveBeenCalled();
      expect(prismaMock.target.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { uri: "example.com/test" },
          create: {
            ...target,
            lastScanDetails: {
              create: lastScanDetails,
            },
          },
          update: {
            queued: false,
            lastScan: 4711,
            errorCount: 0,
            hostname: "example.com",
            lastScanDetails: {
              upsert: {
                create: lastScanDetails,
                update: lastScanDetails,
              },
            },
          },
        })
      );
    }
  );
  it("should validate a change in a scan report", async () => {
    const target = {
      uri: "example.com/test",
      queued: false,
      lastScan: 4711,
      errorCount: 0,
      // make sure the hostname is set correctly.
      hostname: "example.com",
    };

    const prismaMock = {
      scanReport: {
        create: jest.fn(),
        findMany: jest.fn(() => [
          // a last report exists
          {
            dnsSec: false,
          },
        ]),
      },
      target: {
        upsert: jest.fn(() => target),
      },
      lastScanDetails: {
        findFirst: jest.fn(),
      },
    };

    // add a socks5 proxy inside the config
    config.socks5Proxy = "socks5://localhost:9050";
    const scanRPCValidation = jest
      .spyOn(scanService, "scanRPC")
      .mockResolvedValue({
        target: "example.com",
        timestamp: 11,
        result: {
          dnsSec: {
            didPass: true, // we are validating a change - dnsSec did indeed pass
          },
        },
      } as any);

    await reportService.handleNewScanReport(
      "",
      {
        target: "example.com/test",
        timestamp: 4711,
        result: {
          dnsSec: {
            didPass: true, // there was a change - dnsSec did pass
          },
        },
      } as any,
      prismaMock as any,
      {
        refreshCache: false,
        startTimeMS: Date.now(),
      }
    );
    // remove the config again
    config.socks5Proxy = undefined;

    const lastScanDetails = {
      details: expect.objectContaining({
        sut: "example.com/test",
        dnsSec: {
          didPass: true,
        },
      }),
    };
    expect(scanRPCValidation).toHaveBeenCalled();

    expect(prismaMock.scanReport.create).toHaveBeenCalled();
    expect(prismaMock.target.upsert).toHaveBeenCalledWith({
      where: { uri: "example.com/test" },
      create: {
        ...target,
        lastScan: 11, // expect the timestamp from the validation result
        lastScanDetails: {
          create: lastScanDetails,
        },
      },
      update: {
        queued: false,
        lastScan: 11,
        errorCount: 0,
        hostname: "example.com",
        lastScanDetails: {
          upsert: {
            create: lastScanDetails,
            update: lastScanDetails,
          },
        },
      },
    });
  });
  it("should reduce null values by using the last scan report to fill in the gaps", async () => {
    const target = {
      uri: "example.com/test",
      queued: false,
      lastScan: 4711,
      errorCount: 0,
      // make sure the hostname is set correctly.
      hostname: "example.com",
    };

    const prismaMock = {
      scanReport: {
        create: jest.fn(),
        findMany: jest.fn(() => [
          {
            dnsSec: true,
            responsibleDisclosure: true, // there is a value inside the last report
          },
        ]),
      },
      target: {
        upsert: jest.fn(() => target),
      },
      lastScanDetails: {
        findFirst: jest.fn(),
      },
    };

    await reportService.handleNewScanReport(
      "",
      {
        target: "example.com/test",
        timestamp: 4711,
        result: {
          responsibleDisclosure: {
            didPass: null, // could not be checked
          },
          dnsSec: {
            didPass: false,
          },
        },
      } as any,
      prismaMock as any,
      {
        refreshCache: false,
        startTimeMS: Date.now(),
      }
    );

    const replacedLastScanDetails = {
      details: expect.objectContaining({
        sut: "example.com/test",
        dnsSec: {
          didPass: false,
        },
        responsibleDisclosure: {
          didPass: true, // expect the value from the last report - there is nothing else added - see next test
          actualValue: {},
          recommendations: [],
          errors: [],
        },
      }),
    };

    expect(prismaMock.scanReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dnsSec: false,
        responsibleDisclosure: true, // expect the value from the last report
      }),
    });

    expect(prismaMock.target.upsert).toHaveBeenCalledWith({
      where: { uri: "example.com/test" },
      create: {
        ...target,
        lastScanDetails: {
          create: replacedLastScanDetails, // expect replacements from last report
        },
      },
      update: {
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        hostname: "example.com",
        lastScanDetails: {
          upsert: {
            create: replacedLastScanDetails,
            update: replacedLastScanDetails,
          },
        },
      },
    });
  });

  it("should prefer the lastScanDetails over the last scan report to fill null values", async () => {
    const target = {
      uri: "example.com/test",
      queued: false,
      lastScan: 4711,
      errorCount: 0,
      // make sure the hostname is set correctly.
      hostname: "example.com",
    };

    const prismaMock = {
      scanReport: {
        create: jest.fn(),
        findMany: jest.fn(() => [
          {
            dnsSec: true,
            responsibleDisclosure: true, // there is a value inside the last report
          },
        ]),
      },
      target: {
        upsert: jest.fn(() => target),
      },
      lastScanDetails: {
        findFirst: jest.fn(() => ({
          details: {
            sut: "example.com/test",
            dnsSec: {
              didPass: false,
              actualValue: "whatever",
            },
            responsibleDisclosure: {
              didPass: true,
              actualValue: {
                "security.txt": "whatever",
              },
            },
          },
        })),
      },
    };

    await reportService.handleNewScanReport(
      "",
      {
        target: "example.com/test",
        timestamp: 4711,
        result: {
          responsibleDisclosure: {
            didPass: null, // could not be checked
          },
          dnsSec: {
            didPass: false,
          },
        },
      } as any,
      prismaMock as any,
      {
        refreshCache: false,
        startTimeMS: Date.now(),
      }
    );

    const replacedLastScanDetails = {
      details: {
        sut: "example.com/test",
        dnsSec: {
          didPass: false,
        },
        responsibleDisclosure: {
          didPass: true,
          actualValue: {
            "security.txt": "whatever", // from the lastScanDetails NOT from the last scan report
          },
        },
      },
    };

    expect(prismaMock.scanReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dnsSec: false,
        responsibleDisclosure: true, // expect the value from the last scan details
      }),
    });

    expect(prismaMock.target.upsert).toHaveBeenCalledWith({
      where: { uri: "example.com/test" },
      create: {
        ...target,
        lastScanDetails: {
          create: replacedLastScanDetails, // expect replacements from last report
        },
      },
      update: {
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        hostname: "example.com",
        lastScanDetails: {
          upsert: {
            create: replacedLastScanDetails,
            update: replacedLastScanDetails,
          },
        },
      },
    });
  });

  it("should not return that a scan report did change, if one of the values is null and the other one is undefined", () => {
    let actual = reportService.reportDidChange(
      { dnsSec: null } as any,
      { dnsSec: undefined } as any
    );
    expect(actual).toBe(false);

    actual = reportService.reportDidChange(
      { dnsSec: undefined } as any,
      { dnsSec: null } as any
    );

    expect(actual).toBe(false);
  });
});
