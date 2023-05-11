"use client";

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";
import PageTitle from "../../../components/PageTitle";
import ResultEnvelope from "../../../components/ResultEnvelope";
import Button from "../../../components/common/Button";
import FormInput from "../../../components/common/FormInput";
import { useQuicktest } from "../../../hooks/useQuicktest";

interface Props {}
const Content: FunctionComponent<Props> = (props) => {
  const {
    website,
    setWebsite,
    scanRequest,
    refreshRequest,
    target,
    dateString,
    amountPassed,
    handleRefresh,
    onSubmit,
  } = useQuicktest();
  return (
    <div className="flex-1">
      <div className="lg:flex lg:flex-row w-full flex-wrap  items-start justfy-between mb-12 lg:mb-0">
        <div className="flex-1">
          <div className="text-black mb-10 gap-2 flex flex-row items-center">
            <PageTitle
              className="text-2xl text-black mb-0 font-bold"
              stringRep="Schnelltest"
            >
              Schnelltest
            </PageTitle>
          </div>
        </div>
      </div>
      <div className="">
        <form
          onSubmit={onSubmit}
          className="flex items-end flex-wrap gap-2 justify-end"
        >
          <div className="flex-1">
            <FormInput
              label="Domain*"
              onChange={(e) => setWebsite(e)}
              value={website}
              placeholder="example.com"
            />
          </div>

          <Button
            loading={scanRequest.isLoading}
            RightIcon={<FontAwesomeIcon icon={faAngleRight} />}
            type="submit"
          >
            Scan starten
          </Button>
        </form>
        {scanRequest.errored && (
          <small className="text-rot-100 mt-3 -mb-5 flex">
            {scanRequest.errorMessage}
          </small>
        )}
      </div>
      {target !== null && (
        <div className="pt-5 p-0 mt-2">
          <ResultEnvelope
            target={target}
            dateString={dateString}
            handleRefresh={handleRefresh}
            refreshRequest={refreshRequest}
            amountPassed={amountPassed}
          />
        </div>
      )}
    </div>
  );
};

export default Content;
