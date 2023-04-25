import { config } from "../../config";
import { debounce } from "lodash";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { clientHttpClient } from "../../services/clientHttpClient";
import { didPass2CheckResult } from "../../utils/view";
import ResultIcon from "../ResultIcon";
import Button from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import useLoading from "../../hooks/useLoading";
import Spinner from "../Spinner";
import { classNames } from "../../utils/common";

const parseDate = (date: string) => {
  let [day, month, year] = date.split(".");
  if (year.length === 2) {
    year = `20${year}`;
  }
  return new Date(`${year}-${month}-${day}`);
};

interface DiffConfig {
  inspectionType: string;
  start: string;
  end: string;
  collectionIds: number[];
}

const configChange = (a: DiffConfig, b: DiffConfig) => {
  return (
    a.inspectionType !== b.inspectionType ||
    a.start !== b.start ||
    a.end !== b.end ||
    a.collectionIds.length !== b.collectionIds.length ||
    a.collectionIds.some((id, i) => id !== b.collectionIds[i])
  );
};

interface Props {
  displayCollections: number[];
  start?: string;
  end?: string;
  inspectionType: string;
}
const TrendDiff: FunctionComponent<Props> = ({
  displayCollections,
  start,
  end,
  inspectionType,
}) => {
  const lastFetchConfig = useRef<DiffConfig>({
    inspectionType: "",
    start: "",
    end: "",
    collectionIds: [],
  });

  const [isOpen, setIsOpen] = useState(false);

  const diffRequest = useLoading();

  const [diff, setDiff] = useState<{
    true: { uri: string; was: boolean; now: boolean }[];
    false: { uri: string; was: boolean; now: boolean }[];
  }>({
    true: [],
    false: [],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateDiff = async ({
    start,
    end,
    collectionIds,
    inspectionType,
  }: DiffConfig) => {
    // transform start and end to unix timestamp
    diffRequest.loading();
    const url = new URLSearchParams({
      start: parseDate(start).getTime().toString(),
      end: parseDate(end).getTime().toString(),
      collectionIds: collectionIds
        .filter((id) => !config.generateStatsForCollections.includes(id))
        .map((id) => id.toString())
        .join(","),
      inspectionType,
    }).toString();
    const res = await clientHttpClient(`/api/diff?${url}`, crypto.randomUUID());
    const diff: {
      false: Array<{ uri: string; was: boolean; now: boolean }>;
      true: Array<{ uri: string; was: boolean; now: boolean }>;
    } = await res.json();
    setDiff(diff);
    diffRequest.success();
  };

  useEffect(() => {
    if (start && end && isOpen) {
      const config = {
        inspectionType,
        start,
        end,
        collectionIds: displayCollections,
      };
      if (configChange(lastFetchConfig.current, config)) {
        lastFetchConfig.current = config;
        updateDiff(config);
      }
    }
  }, [start, end, displayCollections, inspectionType, updateDiff, isOpen]);

  return (
    <div className="flex-col flex gap-2">
      <div>
        <a
          className="text-sm underline"
          role="button"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Änderungen ausblenden" : "Änderungen anzeigen"}{" "}
          <FontAwesomeIcon
            className={classNames("transition-all", isOpen && "rotate-180")}
            icon={faCaretDown}
          />
        </a>
      </div>
      <div className="flex gap-2 flex-col">
        {isOpen && (
          <>
            {diffRequest.isLoading ? (
              <div className="flex flex-row gap-3 items-center">
                <Spinner />
              </div>
            ) : (
              <>
                {["true", "false"].map((key) => (
                  <div className="flex flex-wrap gap-2" key={key}>
                    {diff[key as "true" | "false"]?.map((d) => {
                      return (
                        <div
                          className="rounded-full text-sm border-2 border-deepblue-50 px-2 py-1 flex flex-row items-center gap-2"
                          key={d.uri}
                        >
                          <span>
                            <ResultIcon
                              size={16}
                              checkResult={didPass2CheckResult(d.now)}
                            />
                          </span>
                          <span>{d.uri}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendDiff;