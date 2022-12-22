import React, { FunctionComponent, useId, useState } from "react";
import Textarea from "./Textarea";

interface Props {
  onChange: (newString: string) => void;
  value: string;
  placeholder?: string;
  label: string;
  validator?: (value: string) => true | string;
}
const FormTextarea: FunctionComponent<Props> = ({
  onChange,
  value,
  label,
  placeholder,
  validator,
}) => {
  const id = useId();
  const [err, setErr] = useState<string | null>(null);
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
    <div className="relative flex-col flex">
      <label htmlFor={id}>
        <span className="text-white">{label}</span>
      </label>
      <Textarea
        id={id}
        onChange={onChange}
        value={value}
        onBlur={validate}
        placeholder={placeholder}
        className="sm:p-2 p-1 text-sm sm:text-base flex-1 outline-lightning-900 transition-all"
      />
      {err !== null && <span className="text-red-500 text-sm mt-1">{err}</span>}
    </div>
  );
};

export default FormTextarea;
