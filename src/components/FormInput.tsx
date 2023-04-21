import React, { FunctionComponent, useEffect, useId, useState } from "react";

interface Props {
  onChange: (newString: string) => void;
  value: string;
  placeholder?: string;
  label: string;
  type?: string;
  validator?: (value: string) => true | string;
}
const FormInput: FunctionComponent<Props> = ({
  onChange,
  value,
  label,
  placeholder,
  type,
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
      <label htmlFor={id} className="mb-1 text-lg font-semibold">
        <span className="text-white">{label}</span>
      </label>
      <input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        type={type ?? "text"}
        onBlur={validate}
        placeholder={placeholder}
        className="sm:p-2 p-2 placeholder-slate-400 text-sm sm:text-base flex-1 outline-lightning-900 transition-all bg-deepblue-400 text-white border border-deepblue-50 rounded-sm focus:border-lightning-900"
      />
      {err !== null && <span className="text-red-500 text-sm mt-1">{err}</span>}
    </div>
  );
};

export default FormInput;
