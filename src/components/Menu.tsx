import React, {
  FunctionComponent,
  MouseEventHandler,
  useCallback,
  useState,
} from "react";
import { classNames } from "../utils/common";

interface Props {
  Button: React.ReactNode;
  Menu: React.ReactNode;
  // clicking on a menu will always close all menus, which have a greater index than the clicked menu
  menuCloseIndex: number;
  buttonClassNames?: string;
}

const selfDestroyingListener = (
  element: Node,
  eventType: string,
  callback: (e: any) => boolean
) => {
  let handler = (e: any) => {
    const shouldRemove = callback(e);
    if (shouldRemove) {
      element.removeEventListener(eventType, handler);
    }
  };
  element.addEventListener(eventType, handler);
};

const Menu: FunctionComponent<Props> = ({
  Button,
  Menu,
  menuCloseIndex,
  buttonClassNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeListener = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMenuClick: MouseEventHandler = (e) => {
    // check if the click was on a menu item which SHOULD close the menu
    // if so, don't stop propagation
    if (
      e.target instanceof HTMLElement &&
      e.target.hasAttribute("data-closemenu")
    ) {
      e.stopPropagation();
      document.removeEventListener("click", closeListener);
      document.dispatchEvent(
        new CustomEvent("menu-click", {
          bubbles: true,
          detail: menuCloseIndex - 1,
        })
      );

      return;
    }

    e.stopPropagation();

    document.dispatchEvent(
      new CustomEvent("menu-click", { bubbles: true, detail: menuCloseIndex })
    );
  };

  const maybeCloseMenuAndUnregisterListener = useCallback(
    (e: CustomEvent) => {
      let event = e as CustomEvent;
      if (event.detail !== undefined && event.detail >= menuCloseIndex) {
        return false;
      }

      setIsOpen(false);
      return true;
    },
    [menuCloseIndex]
  );

  const openMenu: MouseEventHandler = (e) => {
    const current = isOpen;

    setIsOpen((prev) => !prev);
    if (!current) {
      setTimeout(() => {
        selfDestroyingListener(
          document,
          "menu-click",
          maybeCloseMenuAndUnregisterListener
        );

        document.addEventListener("click", closeListener, { once: true });
      }, 100);
    }
  };

  return (
    <div className="relative">
      <button type="button" className={buttonClassNames} onClick={openMenu}>
        {Button}
      </button>
      <div
        onClick={handleMenuClick}
        className={classNames(
          "absolute menu left-0 origin-top-right translate-y-1 -translate-x-3/4 transition-all z-20 menu-list",
          isOpen
            ? "opacity-1 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        )}
      >
        {Menu}
      </div>
    </div>
  );
};

export default Menu;
