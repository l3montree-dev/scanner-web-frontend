import React, {
  FunctionComponent,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { classNames } from "../utils/common";

interface Props {
  Button: React.ReactNode;
  Menu: React.ReactNode;
}
const Menu: FunctionComponent<Props> = ({ Button, Menu }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick: MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  const openMenu: MouseEventHandler = (e) => {
    e.stopPropagation();
    setIsOpen(true);
    setTimeout(
      () =>
        document.addEventListener(
          "click",
          () => {
            setIsOpen(false);
          },
          {
            once: true,
          }
        ),
      0
    );
  };

  useEffect(() => {}, []);
  return (
    <div className="relative">
      <button onClick={openMenu}>{Button}</button>
      <div
        onClick={handleMenuClick}
        className={classNames(
          "absolute menu left-0 origin-top-right -translate-x-3/4 transition-all z-20 menu-list",
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
