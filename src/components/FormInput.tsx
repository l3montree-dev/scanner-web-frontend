import { FunctionComponent, useId, useState } from "react";
import { classNames } from "../utils/common";

interface Props {
  onChange: (newString: string) => void;
  value: string;
  placeholder?: string;
  label: string;
  type?: string;
  validator?: (value: string) => true | string;
  containerClassNames?: string;
  focusColor?: string;
}
const FormInput: FunctionComponent<Props> = ({
  onChange,
  value,
  label,
  type,
  validator,
  containerClassNames,
  focusColor,
}) => {
  focusColor = focusColor ?? "blau-100";

  const id = useId();
  const [err, setErr] = useState<string | null>(null);

  const [focus, setFocus] = useState(false);

  const validate = () => {
    if (validator) {
      const result = validator(value);
      if (result !== true) {
        setErr(result);
      } else if (err !== null) {
        setErr(null);
      }
    }
  };
  return (
    <div className={classNames("relative flex-col flex", containerClassNames)}>
      <label
        htmlFor={id}
        className={classNames(
          "transition-all transition-bund absolute pointer-events-none",
          focus || value !== ""
            ? `text-sm -translate-y-4 text-${focusColor}`
            : "translate-y-1 text-base"
        )}
      >
        <span>{label}</span>
      </label>
      <input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        type={type ?? "text"}
        onBlur={() => {
          setFocus(false);
          validate();
        }}
        onFocus={() => setFocus(true)}
        className={`sm:py-1 py-1 bg-transparent text-sm sm:text-base flex-1 transition-colors border-b focus:outline-none focus:border-${focusColor}`}
      />
      {err !== null && <span className="text-red-500 text-sm mt-1">{err}</span>}
    </div>
  );
};

export default FormInput;
