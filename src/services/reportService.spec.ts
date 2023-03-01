import { ResponsibleDisclosureRecommendation } from "../inspection/result-enums/organizational.typings";
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
        group: "unknown",
      };

      const prismaMock = {
        scanReport: {
          create: jest.fn(),
          findMany: jest.fn(() => reports),
        },
        target: {
          upsert: jest.fn(() => target),
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
      group: "unknown",
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

    // it should NOT replace the values inside the last scan details
    // otherwise we would not only fake the aggregated statistics but also the quicktest itself.
    const lastScanDetails = {
      details: {
        sut: "example.com/test",
        dnsSec: {
          didPass: false,
        },
        responsibleDisclosure: {
          didPass: null, // keep the null value
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
  });
});
