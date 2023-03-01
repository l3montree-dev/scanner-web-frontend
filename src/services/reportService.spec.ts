import { reportService } from "./reportService";

jest.mock("next-auth", () => ({}));

describe("Report Service Test Suite", () => {
  it("should not create a new scan report if the reports did not change", async () => {
    const report = {
      dnsSec: true,
    } as any;
    const prismaMock = {
      scanReport: { findMany: jest.fn(() => [report]) },
      target: {
        update: jest.fn(),
      },
    };
    await reportService.handleNewScanReport(
      {
        result: {
          dnsSec: {
            didPass: true,
          },
        },
      } as any,
      prismaMock as any
    );
    expect(prismaMock.target.update).toHaveBeenCalled();
  });
});
