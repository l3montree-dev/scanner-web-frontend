import { useRouter } from "next/router";
import { FormEvent, FunctionComponent, useState } from "react";
import { useIsGuest } from "../hooks/useIsGuest";
import useLoading from "../hooks/useLoading";
import { classNames } from "../utils/common";
import Button from "./Button";
import DragAndDrop from "./DragAndDrop";
import FormInput from "./FormInput";

const TargetOverviewForm: FunctionComponent<{
  onSearch: (search: string) => Promise<void>;
  onNewDomain: (domain: string) => Promise<void>;
  onFileFormSubmit: (files: File[]) => Promise<void>;
}> = ({ onSearch, onNewDomain, onFileFormSubmit }) => {
  const router = useRouter();

  const [search, setSearch] = useState((router.query.search as string) ?? "");
  const [newDomain, setNewDomain] = useState("");
  const searchRequest = useLoading();
  const createRequest = useLoading();

  const [addDomainIsOpen, setAddDomainIsOpen] = useState(false);
  const [f, setFiles] = useState<File[]>([]);

  const request = useLoading();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    searchRequest.loading();
    try {
      await onSearch(search);
      searchRequest.success();
    } catch (err) {
      searchRequest.error("Leider ist ein Fehler bei der Suche aufgetreten.");
    }
  };

  const handleAddRecord = async (e: FormEvent) => {
    e.preventDefault();
    createRequest.loading();
    try {
      await onNewDomain(newDomain);
      setNewDomain("");
      createRequest.success();
    } catch (err) {
      createRequest.error(
        "Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const handleFileFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      request.loading();
      await onFileFormSubmit(f);
      setFiles([]);
      request.success();
    } catch (e: any) {
      request.error(e.toString());
    }
  };

  const handleDrop = (files: FileList) => {
    setFiles((prev) => prev?.concat(Array.from(files)));
  };

  const isGuest = useIsGuest();

  return (
    <div>
      <div className="flex flex-row items-end">
        <form
          className="flex flex-1 flex-row items-end"
          onSubmit={handleSearch}
        >
          <div className="flex-1">
            <FormInput
              onChange={setSearch}
              label="Suche nach Domains"
              value={search}
              placeholder="example.com"
            />
          </div>
          <div>
            <Button
              spinnerSize={32}
              className="bg-deepblue-100 border border-deepblue-100 ml-2 hover:bg-deepblue-300 text-white p-2"
              type="submit"
              spinnerColor="white"
              loading={searchRequest.isLoading}
            >
              Suchen
            </Button>
          </div>
        </form>
        {!isGuest && (
          <div>
            <Button
              className={classNames(
                "border border-deepblue-100 ml-2 transition-all text-white p-2",
                addDomainIsOpen
                  ? "bg-deepblue-100 hover:bg-deepblue-300"
                  : "hover:bg-deepblue-200"
              )}
              type="submit"
              loading={false}
              onClick={() => setAddDomainIsOpen((prev) => !prev)}
            >
              Eintrag hinzufügen
            </Button>
          </div>
        )}
      </div>
      {!searchRequest.errored && (
        <span className="text-red-500 mt-2">{searchRequest.errorMessage}</span>
      )}
      {
        // Add domain form
        addDomainIsOpen && (
          <>
            <form
              onSubmit={handleAddRecord}
              className="flex flex-row border-t pt-2 border-t-deepblue-200 items-end mt-5"
            >
              <div className="flex-1">
                <FormInput
                  onChange={setNewDomain}
                  label={`Domain hinzufügen`}
                  value={newDomain}
                  placeholder="example.com"
                />
              </div>
              <div className="flex flex-row items-end">
                <Button
                  spinnerSize={32}
                  spinnerColor="white"
                  className="bg-deepblue-100 ml-2 text-white border border-deepblue-100 p-2 transition-all hover:bg-deepblue-300"
                  type="submit"
                  loading={createRequest.isLoading}
                >
                  Hinzufügen
                </Button>
              </div>
            </form>
            {createRequest.successed && (
              <span className="text-lightning-500 block text-right mt-2">
                Domain erfolgreich hinzugefügt.
              </span>
            )}
            {createRequest.errored && (
              <span className="text-red-500 block text-right mt-2">
                {createRequest.errorMessage}
              </span>
            )}

            <div>
              <form onSubmit={handleFileFormSubmit} className="pt-5  flex">
                <div className="flex flex-col flex-1">
                  <div className="flex-col flex">
                    <span className="text-white mb-1">Listenimport</span>
                    <DragAndDrop onDrop={handleDrop}>
                      {f.length > 0 ? (
                        <div className="flex flex-col justify-start items-start flex-1 w-full p-2">
                          {f.map((file) => (
                            <div
                              key={file.name}
                              className="flex mb-2 flex-row w-full justify-between items-center"
                            >
                              <span className="text-white text-sm">
                                {file.name}
                              </span>
                              <button
                                className="text-white bg-deepblue-200 p-2 text-sm cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFiles((prev) =>
                                    prev.filter((f) => f.name !== file.name)
                                  );
                                }}
                              >
                                Entfernen
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-white text-sm">
                            Dateien hierher ziehen oder klicken um hochzuladen.
                          </span>
                          <span className="text-white text-sm">
                            Die Dateien müssen eine Domain pro Zeile enthalten.
                            Domains ausserhalb ihrer verwalteten Netzwerke
                            werden ignoriert.
                          </span>
                        </div>
                      )}
                    </DragAndDrop>
                  </div>
                  <div className="flex flex-row justify-end mt-5">
                    <Button
                      className="bg-deepblue-200 transition-all hover:bg-deepblue-300 border border-deepblue-200 text-white px-4 py-2"
                      loading={request.isLoading}
                      spinnerColor="white"
                      type="submit"
                    >
                      Domains dem System hinzufügen
                    </Button>
                    <Button
                      className="border hover:bg-deepblue-200 transition-all border-deepblue-100 ml-2 text-white p-2"
                      type="submit"
                      loading={createRequest.isLoading}
                      onClick={() => setAddDomainIsOpen(false)}
                    >
                      Schliessen
                    </Button>
                  </div>
                </div>
              </form>
              {request.successed && (
                <span className="text-lightning-500 text-right w-full block mt-2">
                  Domains werden im Hintergrund dem System hinzugefügt
                </span>
              )}
              {request.errored && (
                <span className="text-red-600 text-right text-sm mt-3 block">
                  {request.errorMessage}
                </span>
              )}
            </div>
          </>
        )
      }
    </div>
  );
};

export default TargetOverviewForm;
