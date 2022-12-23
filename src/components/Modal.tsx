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
}
const Modal: FunctionComponent<Props> = (props) => {
  const ref = useRef<HTMLElement | null>(null);

  const delayedIsOpen = useDelayChange(props.isOpen, 250);
  useEffect(() => {
    ref.current = document.querySelector("#modal");
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (props.isOpen && body) {
      body.style.overflow = "hidden";
    } else if (body && !delayedIsOpen) {
      body.style.overflow = "auto";
    }
  }, [props.isOpen, delayedIsOpen]);

  return ref.current !== null
    ? createPortal(
        <div
          className={classNames(
            "fixed top-0 bottom-0 left-0 transition-all right-0",
            !props.isOpen && "opacity-0 pointer-events-none"
          )}
        >
          <div className="backdrop absolute top-0 bottom-0 left-0 right-0 bg-black opacity-50" />
          <div className="flex justify-center relative h-full overflow-auto z-10">
            <div className="py-10 h-max">
              <div className="relative">
                <div
                  className={classNames(
                    "max-w-screen-lg bg-deepblue-500 p-10 transition-all border border-deepblue-100",
                    props.isOpen ? "scale-100" : "scale-50"
                  )}
                >
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
                  <div className="flex-1">{props.children}</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        ref.current
      )
    : null;
};

export default Modal;