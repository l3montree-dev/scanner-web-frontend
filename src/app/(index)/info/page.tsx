import React, { FunctionComponent } from "react";
import { redirect } from "next/navigation";
import { withNotAvailable } from "../../../decorators/withNotAvailable";
import InfoContent from "../../../components/InfoContent";
import BPAHeader from "../../../components/bpa/BPAHeader";

interface Props {
  displayNotAvailable: boolean;
}
const page: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  if (displayNotAvailable) {
    return redirect("/");
  }
  return <InfoContent />;
};

export default withNotAvailable(page);
