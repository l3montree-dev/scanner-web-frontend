import Link from "next/link";
import { useSession } from "../hooks/useSession";
import { classNames, isGuestUser } from "../utils/common";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";

interface Props<T extends { id: number; title: string; color: string }> {
  collections: {
    [collectionId: string]: T;
  };
  selectedCollections: number[];
  onCollectionClick: (collection: T) => void;
  Button: JSX.Element;
  nestedMenu?: boolean;
}
function CollectionMenu<T extends { id: number; title: string; color: string }>(
  props: Props<T>
) {
  const user = useSession();
  return (
    <Menu
      menuCloseIndex={0}
      buttonClassNames="w-full"
      Button={props.Button}
      nestedMenu={props.nestedMenu}
      Menu={
        <MenuList>
          {Object.values(props.collections ?? {}).map((collection) => {
            const selected = props.selectedCollections.includes(+collection.id);
            return (
              <button
                className={classNames(
                  "flex w-full transition-all  items-center px-2 py-2",
                  selected
                    ? "bg-deepblue-100 hover:bg-deepblue-200"
                    : "bg-deepblue-300 hover:bg-deepblue-200"
                )}
                key={collection.id}
                onClick={() => props.onCollectionClick(collection)}
              >
                <div
                  className="w-3 h-3 flex flex-row items-center justify-center rounded-full mr-2"
                  style={{
                    backgroundColor: collection.color,
                  }}
                ></div>
                {collection.title}
              </button>
            );
          })}
          {!isGuestUser(user.data?.user) && (
            <Link href={"/dashboard/collections"}>
              <MenuItem>Sammlung erstellen</MenuItem>
            </Link>
          )}
        </MenuList>
      }
    />
  );
}

export default CollectionMenu;
