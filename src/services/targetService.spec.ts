import { InspectionTypeEnum } from "../inspection/scans";
import { targetService } from "./targetService";

jest.mock("next-auth", () => ({}));

describe("Target Service Test Suite", () => {
  it("should upsert the target if handleNewTarget is called", async () => {
    const prismaMock = {
      target: {
        upsert: jest.fn(),
      },
    } as any;
    await targetService.handleNewTarget(
      {
        uri: "example.com/test",
      },
      prismaMock
    );
    expect(prismaMock.target.upsert).toHaveBeenCalledWith({
      where: { uri: "example.com/test" },
      update: {},
      create: {
        uri: "example.com/test",
        lastScan: null,
        group: "unknown",
        queued: false,
        hostname: "example.com",
      },
    });
  });
  it("should create a user target relation if a user is provided", async () => {
    const prismaMock = {
      target: {
        upsert: jest.fn(),
      },
      targetCollectionRelation: {
        create: jest.fn(),
      },
    } as any;
    await targetService.handleNewTarget(
      {
        uri: "example.com/test",
      },
      prismaMock,
      { id: "1234", defaultCollectionId: 4711 } as any
    );
    expect(prismaMock.targetCollectionRelation.create).toHaveBeenCalledWith({
      data: {
        collectionId: 4711,
        uri: "example.com/test",
      },
    });
  });
  it("should create a target even if the scan failed", async () => {
    const prismaMock = {
      target: {
        upsert: jest.fn(),
      },
    } as any;

    await targetService.handleTargetScanError(
      {
        target: "example.com/test",
      } as any,
      prismaMock
    );
    expect(prismaMock.target.upsert).toHaveBeenCalledWith({
      where: {
        uri: "example.com/test",
      },
      update: {
        lastScan: expect.any(Number),
        queued: false,
        errorCount: {
          increment: 1,
        },
      },
      create: {
        errorCount: 1,
        uri: "example.com/test",
        group: "unknown",
        lastScan: expect.any(Number),
        hostname: "example.com",
      },
    });
  });
  it.each([
    ...Object.values(InspectionTypeEnum).map((value) => ({
      sort: value,
      expected: `sr."${value}"`,
    })),
    {
      sort: Math.random().toString().substring(2), // any other value should default to uri.
      expected: "t.uri",
    },
    {
      sort: undefined,
      expected: "t.uri",
    },
  ])(
    "should not be possible to inject arbitrary data to the sql statement when fetching the targets with their latest network results: %s",
    async ({ sort, expected }) => {
      const prismaMock = {
        target: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        $queryRawUnsafe: jest.fn(() => []),
      } as any;

      await targetService.getUserTargetsWithLatestTestResult(
        { id: "abc", role: null, defaultCollectionId: 0 },
        {
          sort: sort,
          sortDirection: "1",
          page: 0,
          pageSize: 10,
        },
        prismaMock
      );

      const query = prismaMock.$queryRawUnsafe.mock.calls[0][0];
      const expectedQuery = `
      SELECT count(*) OVER() AS "totalCount", t.*, lsd.details as details from targets t
      LEFT JOIN scan_reports sr on t.uri = sr.uri
      LEFT JOIN last_scan_details lsd on t.uri = lsd.uri
      WHERE NOT EXISTS(
          SELECT 1 from scan_reports sr2 where sr.uri = sr2.uri AND sr."createdAt" < sr2."createdAt"
        )
        AND EXISTS( SELECT 1 from target_collections tc where tc.uri = t.uri AND tc."collectionId" = $1 )
        ORDER BY ${expected} ASC
        LIMIT $2
        OFFSET $3;
`;
      expect(
        query
          .split("\n")
          .filter((s: string) => s.length > 0)
          .map((s: string) => s.trim())
          .join(" ")
          .replace(/\s+/g, " ")
      ).toEqual(
        expectedQuery
          .split("\n")
          .filter((s: string) => s.length > 0)
          .map((s) => s.trim())
          .join(" ")
          .replace(/\s+/g, " ")
      );
    }
  );

  it("should mark the targets as queued after retrieving them from the database for scanning", async () => {
    const targets = [
      {
        uri: "example.com/test",
      },
      {
        uri: "example.com/test2",
      },
    ];
    const prismaMock = {
      target: {
        findMany: jest.fn(() => targets),
        updateMany: jest.fn(),
      },
    } as any;

    await targetService.getTargets2Scan(prismaMock);
    expect(prismaMock.target.updateMany).toHaveBeenCalledWith({
      where: {
        uri: {
          in: ["example.com/test", "example.com/test2"],
        },
      },
      data: {
        queued: true,
      },
    });
    expect(prismaMock.target.updateMany).toHaveBeenCalledWith({
      where: {
        uri: {
          in: ["example.com/test", "example.com/test2"],
        },
      },
      data: {
        queued: true,
      },
    });
  });
});
