import { reportService } from "./reportService";

jest.mock("next-auth", () => ({}));

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
    await reportService.handleNewScanReport(
      {
        target: "example.com",
        timestamp: 4711,
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      } as any,
      prismaMock as any
    );

    const lastScanDetails = {
      details: {
        sut: "example.com",
        dnsSec: {
          didPass: true,
        },
      },
    };
    // it should not create a new scan report.
    expect(prismaMock.scanReport.create).not.toHaveBeenCalled();
    expect(prismaMock.target.update).toHaveBeenCalledWith({
      where: { uri: "example.com" },
      data: {
        queued: false,
        lastScan: 4711,
        errorCount: 0,
        lastScanDetails: {
          upsert: {
            create: lastScanDetails,
            update: lastScanDetails,
          },
        },
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
    "should create a new scan report if the reports did %s",
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
        {
          target: "example.com/test",
          timestamp: 4711,
          result: {
            dnsSec: {
              didPass: true,
            },
          },
        } as any,
        prismaMock as any
      );

      const lastScanDetails = {
        details: {
          sut: "example.com/test",
          dnsSec: {
            didPass: true,
          },
        },
      };

      expect(prismaMock.scanReport.create).toHaveBeenCalled();
      expect(prismaMock.target.upsert).toHaveBeenCalledWith({
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
          lastScanDetails: {
            upsert: {
              create: lastScanDetails,
              update: lastScanDetails,
            },
          },
        },
      });
    }
  );
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
      prismaMock as any
    );

    const replacedLastScanDetails = {
      details: {
        sut: "example.com/test",
        dnsSec: {
          didPass: false,
        },
        responsibleDisclosure: {
          didPass: true, // expect the value from the last report - there is nothing else added - see next test
        },
      },
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
      prismaMock as any
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
