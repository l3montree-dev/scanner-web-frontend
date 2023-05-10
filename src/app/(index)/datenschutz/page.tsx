import { FunctionComponent } from "react";
import Article from "../../../components/Article";
import Content from "./content";
import { withNotAvailable } from "../../../decorators/withNotAvailable";

interface Props {
  displayNotAvailable: boolean;
}
const Privacy: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  return <Content displayNotAvailable={displayNotAvailable} />;
};

export default withNotAvailable(Privacy);
