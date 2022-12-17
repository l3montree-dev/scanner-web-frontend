import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import React, { useState } from "react";
import FormTextarea from "../../components/FormTextarea";
import Meta from "../../components/Meta";
import Page from "../../components/Page";
import PrimaryButton from "../../components/PrimaryButton";
import useLoading from "../../hooks/useLoading";
import { clientHttpClient } from "../../services/clientHttpClient";
import { ISession } from "../../types";
import { isAdmin, parseNetworkString } from "../../utils/common";
import { isValidIp, isValidMask } from "../../utils/validator";
import { authOptions } from "../api/auth/[...nextauth]";

const Network = () => {
  const request = useLoading();

  const [networks, setNetworks] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const n = parseNetworkString(networks);
      request.loading();
      await clientHttpClient("/api/networks", crypto.randomUUID(), {
        method: "POST",
        body: JSON.stringify(n),
      });
      request.success();
    } catch (e: any) {
      request.error(e.toString());
    }
  };
  return (
    <Page>
      <Meta />
      <div className="flex md:py-10 flex-col w-full justify-center">
        <div className="max-w-screen-lg w-full md:p-5 mx-auto">
          <div className="md:bg-deepblue-400 md:mt-0 mt-10 md:p-10 p-5">
            <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
              <h1 className="text-5xl sm:order-1 order-2 mb-3 text-white font-bold">
                Netzwerke hinzufügen
              </h1>
            </div>

            <div className="pb-14">
              <form onSubmit={onSubmit} className="pt-10  flex">
                <div className="flex flex-col flex-1">
                  <div className="flex-col flex">
                    <FormTextarea
                      label="Netzwerke (CIDR-Notation) *"
                      onChange={setNetworks}
                      value={networks}
                      validator={(value) => {
                        const networksArray = value.trim().split("\n");
                        // check if each network is in cidr notation.

                        const networksValid = networksArray.every((network) => {
                          const [ip, mask] = network.split("/");
                          if (ip === undefined || mask === undefined) {
                            return false;
                          }
                          const ipValid = isValidIp(ip);
                          const maskValid = isValidMask(mask);
                          return ipValid && maskValid;
                        });
                        if (!networksValid) {
                          return "Bitte trage gültige Netzwerke ein.";
                        }
                        return true;
                      }}
                      placeholder={`45.10.26.0/24
45.12.32.0/16
                        `}
                    />
                    <span className="text-white text-right text-sm mt-1">
                      Mehrere Netzwerke können durch Zeilenumbrüche getrennt
                      werden.
                    </span>
                  </div>
                  <div className="flex flex-row justify-end mt-5">
                    <PrimaryButton loading={request.isLoading} type="submit">
                      Netzwerke dem System hinzufügen
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
              Mit Abschicken des Formulars werden die Netzwerke Domain-Namen
              aufgelöst und die Domains werden iterativ gescanned.
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
