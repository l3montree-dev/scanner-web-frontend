import { act, fireEvent, render, screen } from "@testing-library/react";
import Home from "./index.page";
import "@testing-library/jest-dom";
import mockRouter from "next-router-mock";
import { buildJSONResponse, mockFetch } from "../test-utils/fetchUtils";
import * as Head from "next/head";

jest.mock("next-auth/react", () => ({
  useSession: () => [null, false],
}));

describe("Quicktest Test", () => {
  it("renders the quicktest page", () => {
    render(<Home displayNotAvailable={false} code="unknown" />);
    expect(screen.getByText("OZG-Security-Challenge 2023")).toBeInTheDocument();
    expect(screen.getByText("Schnelltest")).toBeInTheDocument();
    expect(screen.getByText("BETA")).toBeInTheDocument();
    expect(screen.getByText("Scan starten")).toBeInTheDocument();
  });
  it("should render the not available page", () => {
    render(<Home displayNotAvailable={true} code="unknown" />);
    expect(screen.getByText("Neugierig?")).toBeInTheDocument();
    expect(screen.getByText("ozgsec@bmi.bund.de")).toBeInTheDocument();
  });

  it("should call the scan api automatically if a site query parameter is found", async () => {
    mockRouter.push({
      query: {
        site: "example.com",
      },
    });
    const [fetchMock, resp] = mockFetch(
      buildJSONResponse({
        details: {
          sut: "example.com",
        },
      })
    );
    render(<Home displayNotAvailable={false} code="unknown" />);

    await act(() => resp);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scan?site=example.com&s=unknown",
      expect.anything()
    );
  });

  it("should update the site query parameter after scanning", async () => {
    const [_, resp] = mockFetch(
      buildJSONResponse({
        details: {
          sut: "example.com",
        },
      })
    );
    render(<Home displayNotAvailable={false} code="unknown" />);

    const input = await screen.findByPlaceholderText("example.com");
    fireEvent.change(input, { target: { value: "example.com" } });

    const button = await screen.findByText("Scan starten");
    fireEvent.click(button);

    await act(() => resp);

    expect(mockRouter).toMatchObject({
      query: {
        site: "example.com",
      },
    });
  });
  it("should include the correct canonical url", () => {
    mockRouter.push({
      pathname: "/",
    });

    jest
      .spyOn(Head, "default")
      .mockImplementation(({ children }) => <div>{children}</div>);
    render(<Home displayNotAvailable={false} code="unknown" />);
    expect(screen.getByTestId("canonical").getAttribute("href")).toEqual(
      "https://ozgsec.de/"
    );
  });
});
