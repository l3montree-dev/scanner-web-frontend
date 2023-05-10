import { FunctionComponent } from "react";
import IndexContent from "../../components/IndexContent";
import { withNotAvailable } from "../../decorators/withNotAvailable";

const Index: FunctionComponent<{ displayNotAvailable: boolean }> = ({
  displayNotAvailable,
}) => {
  return <IndexContent displayNotAvailable={displayNotAvailable} />;
};

export default withNotAvailable(Index);
