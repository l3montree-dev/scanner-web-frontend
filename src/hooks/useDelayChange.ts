import { useEffect, useState } from "react";

export default function useDelayChange(inputStateVar: any, delay = 500) {
  const [outputStateVar, setOutputStateVar] = useState(inputStateVar);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOutputStateVar(inputStateVar);
    }, delay);
    return () => clearTimeout(timer);
  }, [inputStateVar]);

  return outputStateVar;
}
