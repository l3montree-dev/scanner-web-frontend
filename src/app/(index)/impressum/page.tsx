import { FunctionComponent } from "react";
import { withNotAvailable } from "../../../decorators/withNotAvailable";
import Content from "./content";

interface Props {
  displayNotAvailable: boolean;
}
const Imprint: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  return <Content displayNotAvailable={displayNotAvailable} />;
};

export default withNotAvailable(Imprint);
