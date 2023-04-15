import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Dialog from "@radix-ui/react-dialog";
import React, { FunctionComponent } from "react";
import Button from "./common/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}
const Modal: FunctionComponent<Props> = (props) => {
  return (
    <Dialog.Root
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay z-20 bg-black/50" />
        <Dialog.Content className="DialogContent border-t border-t-deepblue-50 z-30 bg-deepblue-200 rounded-md text-white">
          <div className="flex flex-row mb-5 justify-between">
            <Dialog.Title className="DialogTitle text-xl font-bold">
              {props.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button aria-label="Close">
                <div className="flex flex-row items-center">
                  <FontAwesomeIcon className="-mb-0" icon={faTimes} />
                </div>
              </Button>
            </Dialog.Close>
          </div>
          {props.children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
