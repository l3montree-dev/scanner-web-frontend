import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useDelayChange from "../hooks/useDelayChange";
import { classNames } from "../utils/common";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}
const Modal: FunctionComponent<Props> = (props) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  const delayedIsOpen = useDelayChange(props.isOpen, 250);
  const displayContent = useDelayChange(props.isOpen, 250, (oldValue) => {
    // if we are transitioning from open to closed we want to delay it - otherwise we want to show it immediately
    return oldValue;
  });
  useEffect(() => {
    setRef(document.querySelector("#modal") as HTMLElement);
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (props.isOpen && body) {
      body.style.overflow = "hidden";
    } else if (body && !delayedIsOpen) {
      body.style.overflow = "auto";
    }
  }, [props.isOpen, delayedIsOpen]);

  if (!ref) {
    return null;
  }
  return createPortal(
    <div
      className={classNames(
        "fixed z-50 top-0 bottom-0 opacity-1 left-0 transition-all right-0",
        !props.isOpen && "opacity-0 pointer-events-none"
      )}
    >
      <div
        onClick={props.onClose}
        className="backdrop absolute top-0 bottom-0 left-0 right-0 bg-black opacity-50"
      />
      <div className="flex justify-center relative h-full overflow-auto z-10">
        <div className="md:py-5 mt-14 py-0 h-max">
          <div className="relative">
            <div
              className={classNames(
                "max-w-screen-lg pointer-events-auto bg-deepblue-500 modal p-5 transition-all border border-deepblue-100",
                props.isOpen ? "scale-100" : "scale-50"
              )}
            >
              {displayContent && (
                <>
                  <div className="flex flex-row items-center justify-between">
                    <h5 className="text-white text-xl font-bold">
                      {props.title}
                    </h5>
                    <button
                      aria-label="Modal schliessen"
                      className="w-10 h-10 flex flex-col justify-center items-center bg-deepblue-200"
                      onClick={props.onClose}
                    >
                      <FontAwesomeIcon
                        className="text-white text-xl"
                        icon={faTimes}
                      />
                    </button>
                  </div>

                  <div className="flex-1">{props.children}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    ref
  );
};

export default Modal;
