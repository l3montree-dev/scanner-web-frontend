import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import React, { useState } from "react";
import DragAndDrop from "../../components/DragAndDrop";
import Meta from "../../components/Meta";
import Page from "../../components/Page";
import PrimaryButton from "../../components/PrimaryButton";
import useLoading from "../../hooks/useLoading";
import { clientHttpClient } from "../../services/clientHttpClient";
import { ISession } from "../../types";
import { isAdmin } from "../../utils/common";
import { authOptions } from "../api/auth/[...nextauth]";

const Network = () => {
  const request = useLoading();

  const [f, setFiles] = useState<File[]>([]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      f.forEach((file) => {
        formData.append("files", file);
      });

      request.loading();

      await clientHttpClient("/api/domains", crypto.randomUUID(), {
        method: "POST",
        body: formData,
      });
      request.success();
    } catch (e: any) {
      request.error(e.toString());
    }
  };

  const handleDrop = (files: FileList) => {
    setFiles((prev) => prev?.concat(Array.from(files)));
  };
  return (
    <Page>
      <Meta />
      <div className="flex md:py-10 flex-col w-full justify-center">
        <div className="max-w-screen-lg w-full md:p-5 mx-auto">
          <div className="md:bg-deepblue-400 md:mt-0 mt-10 md:p-10 p-5">
            <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
              <h1 className="text-5xl sm:order-1 order-2 mb-3 text-white font-bold">
                Domains hinzufügen
              </h1>
            </div>

            <div className="pb-14">
              <form onSubmit={onSubmit} className="pt-10  flex">
                <div className="flex flex-col flex-1">
                  <div className="flex-col flex">
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
                            Es können nur .csv Dateien hochgeladen werden.
                          </span>
                        </div>
                      )}
                    </DragAndDrop>
                    <span className="text-white text-right text-sm mt-1">
                      Die Dateien müssen eine Domain pro Zeile enthalten.
                    </span>
                  </div>
                  <div className="flex flex-row justify-end mt-5">
                    <PrimaryButton loading={request.isLoading} type="submit">
                      Domains dem System hinzufügen
                    </PrimaryButton>
                  </div>
                </div>
              </form>

              {request.errored && (
                <span className="text-red-600 absolute text-sm mt-3 block">
                  {request.errorMessage}
                </span>
              )}
            </div>
            <p className="text-white">
              Mit Abschicken des Formulars werden die Domains gescanned.
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = (await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )) as ISession;

  // check if the user is an admin
  // if not, redirect him to the dashboard page.
  if (!isAdmin(session)) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Network;
