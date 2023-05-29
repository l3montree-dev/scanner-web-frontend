import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getErrorMessage } from "../messages/http";
import { clientHttpClient } from "../services/clientHttpClient";
import { DetailedTarget, IScanSuccessResponse } from "../types";
import { sanitizeURI } from "../utils/common";
import { DTO } from "../utils/server";
import useLoading from "./useLoading";

const isInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export function useQuicktest(code?: string | null) {
  const [website, setWebsite] = useState("");
  const scanRequest = useLoading();
  const refreshRequest = useLoading();
  const [target, setTarget] = useState<null | DTO<DetailedTarget>>(null);
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();

  const onSubmit = useCallback(
    async (e: FormEvent, site: string) => {
      e.preventDefault();

      // test if valid url
      const target = sanitizeURI(site);
      if (!target) {
        scanRequest.error("Bitte trage einen gültigen Domainnamen ein.");
        return;
      }
      // react will batch those two calls anyways.
      scanRequest.loading();
      setTarget(null);
      // do the real api call.
      // forward the secret of query param s to the backend
      try {
        const response = await clientHttpClient(
          `/api/v1/scan?site=${encodeURIComponent(target)}&s=${code}`,
          crypto.randomUUID()
        );
        if (!response.ok) {
          const err = await response.json();
          return scanRequest.error(
            `Es ist ein Fehler aufgetreten - Fehlermeldung: ${getErrorMessage(
              err.error
            )}`
          );
        }
        const obj: DTO<DetailedTarget> = await response.json();
        setTarget(obj);
        scanRequest.success();
      } catch (e) {
        scanRequest.error(
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
        );
      }
    },
    [scanRequest, code]
  );
  useEffect(() => {
    if (target) {
      const rec = document.getElementById("test-results");
      if (rec && !isInViewport(rec)) {
        window.scrollTo({
          top:
            rec.getBoundingClientRect().top +
            window.scrollY -
            window.innerHeight / 16,
          behavior: "smooth",
        });
      }
    }
  }, [target]);

  const scannedSite = useRef<null | string>(null);

  useEffect(() => {
    const site = query?.get("site");
    if (site && scannedSite.current !== site) {
      scannedSite.current = site;
      setWebsite(site);
      onSubmit(
        {
          preventDefault: () => {},
        } as FormEvent,
        query?.get("site") as string
      );
    }
  }, [query, onSubmit]);

  const handleRefresh = async () => {
    if (!target) {
      return;
    }
    refreshRequest.loading();

    try {
      const response = await clientHttpClient(
        `/api/v1/scan?site=${encodeURIComponent(
          target.uri
        )}&refresh=true&s=${code}`,
        crypto.randomUUID()
      );
      if (!response.ok) {
        const err = await response.json();
        return refreshRequest.error(
          `Es ist ein Fehler aufgetreten - Fehlermeldung: ${getErrorMessage(
            err.error.code
          )}`
        );
      }
      const obj = await response.json();
      setTarget(obj);
      refreshRequest.success();
    } catch (e) {
      refreshRequest.error(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    }
  };

  const amountPassed = useMemo(() => {
    if (!target) return 0;
    return Object.keys(target.details as Record<string, any>)
      .filter((key) =>
        (
          [
            TLSInspectionType.TLSv1_3,
            TLSInspectionType.DeprecatedTLSDeactivated,
            NetworkInspectionType.RPKI,
            DomainInspectionType.DNSSec,
            HeaderInspectionType.HSTS,
            OrganizationalInspectionType.ResponsibleDisclosure,
          ] as string[]
        ).includes(key)
      )
      .map(
        (key) =>
          (target.details as IScanSuccessResponse["result"])[
            key as InspectionType
          ]?.didPass
      )
      .filter((inspection) => !!inspection).length;
  }, [target]);

  const dateString = target
    ? new Date(Number(target.lastScan)).toLocaleString()
    : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      ...Object.fromEntries((query ?? new URLSearchParams()).entries()),
      site: website,
    });
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return {
    website,
    setWebsite,
    onSubmit: handleSubmit,
    scanRequest,
    refreshRequest,
    target,
    handleRefresh,
    amountPassed,
    dateString,
  };
}
