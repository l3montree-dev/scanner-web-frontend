import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { classNames } from "../utils/style-utils";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
}
const Dialog: FunctionComponent<Props> = (props) => {
  const ref = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    ref.current = document.querySelector("#modal");
    setMounted(true);
  }, [mounted]);

  useEffect(() => {
    const body = document.querySelector("body");
    if (props.isOpen && body) {
      body.style.overflow = "hidden";
    } else if (body) {
      body.style.overflow = "auto";
    }
  }, [props.isOpen]);
  return mounted && ref.current !== null && props.isOpen
    ? createPortal(
        <div
          className={classNames(
            "fixed flex flex-row items-center justify-center top-0 bottom-0 left-0 right-0"
          )}
        >
          <div className="backdrop absolute top-0 bottom-0 left-0 right-0 bg-deepblue-400 opacity-50" />
          <div className="max-w-screen-lg z-10 lg:h-3/4 h-full bg-deepblue-600">
            <div className="flex flex-col  overflow-auto h-full">
              <div className="flex flex-row justify-end">
                <button
                  className="w-10 h-10 flex flex-col justify-center items-center m-3 bg-deepblue-200"
                  onClick={props.onClose}
                >
                  <FontAwesomeIcon
                    className="text-white text-xl"
                    icon={faTimes}
                  />
                </button>
              </div>
              <div className="flex-1 lg:overflow-visible overflow-auto">
                {props.children}
              </div>
            </div>
          </div>
        </div>,
        ref.current
      )
    : null;
};

export default Dialog;
