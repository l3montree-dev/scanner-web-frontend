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
  const toggle: MouseEventHandler = (e) => setIsOpen(!isOpen);

  const handleMenuClick: MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener("click", () => setIsOpen(false));
    return () => {
      document.removeEventListener("click", () => setIsOpen(false));
    };
  }, []);
  return (
    <>
      <div onClick={handleMenuClick} className="relative">
        <button className="hover:bg-deepblue-300" onClick={toggle}>
          {Button}
        </button>
        <div
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
    </>
  );
};

export default Menu;
