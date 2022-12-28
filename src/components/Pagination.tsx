import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useMemo } from "react";
import { PaginateResult } from "../types";
import { classNames } from "../utils/common";

const buildArray = (length: number, currentPage: number) => {
  const res = [];
  for (
    let i = Math.max(0, currentPage - 2);
    i < Math.min(currentPage + 3, length + 1);
    i++
  ) {
    res.push(i);
  }
  return res;
};
type Props = Omit<PaginateResult<any>, "data"> & {
  onPageChange: (page: number) => void;
};
const Pagination: FunctionComponent<Props> = (props) => {
  const lastPage = Math.floor(props.total / props.pageSize);
  const pages = useMemo(
    () => buildArray(lastPage, props.page),
    [props.page, lastPage]
  );

  return (
    <div>
      {props.page > 2 && (
        <button
          onClick={() => props.onPageChange(0)}
          className={classNames(
            "h-8 w-8 mx-1 mr-5 border border-deepblue-50 transition-all hover:bg-deepblue-500"
          )}
        >
          1
        </button>
      )}
      {pages.map((i) => {
        return (
          <button
            onClick={() => props.onPageChange(i)}
            className={classNames(
              "h-8 w-8 mx-1 border border-deepblue-50 transition-all hover:bg-deepblue-500",
              i === props.page && "bg-deepblue-500"
            )}
            key={i}
          >
            {i + 1}
          </button>
        );
      })}
      {props.page !== lastPage && (
        <button
          onClick={() =>
            props.onPageChange(Math.floor(props.total / props.pageSize))
          }
          className={classNames(
            "h-8 ml-5 w-8 mx-1 border border-deepblue-50 transition-all hover:bg-deepblue-500"
          )}
        >
          {Math.floor(props.total / props.pageSize) + 1}
        </button>
      )}
    </div>
  );
};

export default Pagination;
