import { FunctionComponent } from "react";
import { VictoryLabel } from "victory";
import { tailwindColors } from "../../utils/view";

export const RefLabelComponent: FunctionComponent<any & { fill: string }> = (
  props
) => {
  const totalElements = props.data?.length - 1;
  const totalRefComponents = props.nRefComponents;
  // evenly space the labels
  const refComponentIndex =
    props.i * Math.floor(totalElements / totalRefComponents);
  if (refComponentIndex === +props.index) {
    return (
      <VictoryLabel
        {...props}
        textAnchor={"middle"}
        verticalAnchor={"middle"}
        backgroundPadding={2}
        // make sure to never overlap with the y-axis
        dx={30}
        dy={-2}
        backgroundStyle={{
          fill: tailwindColors.deepblue["300"],
        }}
        style={{
          fontSize: 10,
          fill: props.fill,
        }}
      />
    );
  } else if (props.data.length - 1 === +(props.index ?? 0)) {
    return (
      <VictoryLabel
        {...props}
        textAnchor={"end"}
        verticalAnchor={"middle"}
        backgroundPadding={3}
        dx={30}
        dy={-3}
        style={{
          fontSize: 10,
          fill: props.fill,
        }}
      />
    );
  }
  return null;
};
