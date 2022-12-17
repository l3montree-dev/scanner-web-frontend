import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import React, { useEffect, useState } from "react";
import FormInput from "../../components/FormInput";
import FormTextarea from "../../components/FormTextarea";
import Meta from "../../components/Meta";
import Page from "../../components/Page";
import PrimaryButton from "../../components/PrimaryButton";
import useLoading from "../../hooks/useLoading";
import { clientHttpClient } from "../../services/clientHttpClient";
import { CreateUserDTO, Session } from "../../types";
import { isAdmin } from "../../utils/common";
import { isValidEmail, isValidIp, isValidMask } from "../../utils/validator";
import { authOptions } from "../api/auth/[...nextauth]";

export const parseCreateUserForm = ({
  firstName,
  lastName,
  email,
  networks,
  username,
}: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  networks: string;
}): CreateUserDTO => {
  if (username.length === 0) {
    throw new Error("Bitte trage einen Nutzernamen ein.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Bitte trage eine gültige E-Mail ein.");
  }

  // parse the networks - they are line separated
  const networksArray = networks.trim().split("\n");
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
    throw new Error("Bitte trage gültige Netzwerke ein.");
  }

  return {
    firstName,
    lastName,
    email,
    networks: networksArray,
    username,
  };
};

const Administration = () => {
  const createRequest = useLoading();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [networks, setNetworks] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const createUserDTO = parseCreateUserForm({
        firstName,
        lastName,
        email,
        networks,
        username,
      });
      createRequest.loading();
      await clientHttpClient("/api/users", crypto.randomUUID(), {
        method: "POST",
        body: JSON.stringify(createUserDTO),
      });
      createRequest.success();
    } catch (e: any) {
      createRequest.error(e.toString());
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
                Nutzer erstellen
              </h1>
            </div>

            <div className="pb-14">
              <form onSubmit={onSubmit} className="pt-10  flex">
                <div className="flex flex-col flex-1">
                  <FormInput
                    label="Nutzername *"
                    validator={(value) => {
                      if (value.length === 0) {
                        return "Bitte trage einen Nutzernamen ein.";
                      }
                      return true;
                    }}
                    onChange={setUsername}
                    value={username}
                  />
                  <div className="mt-4 flex-col flex">
                    <FormInput
                      label="Vorname"
                      onChange={setFirstName}
                      value={firstName}
                    />
                  </div>
                  <div className="mt-4 flex-col flex">
                    <FormInput
                      label="Nachname"
                      onChange={setLastName}
                      value={lastName}
                    />
                  </div>
                  <div className="mt-4 flex-col flex">
                    <FormInput
                      label="Email-Adresse *"
                      onChange={setEmail}
                      validator={(value) => {
                        if (!isValidEmail(value)) {
                          return "Bitte eine gültige Email-Adresse eingeben.";
                        }
                        return true;
                      }}
                      value={email}
                    />
                  </div>
                  <div className="mt-4 flex-col flex">
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
                    <PrimaryButton
                      loading={createRequest.isLoading}
                      type="submit"
                    >
                      Nutzer anlegen
                    </PrimaryButton>
                  </div>
                </div>
              </form>

              {createRequest.errored && (
                <span className="text-red-600 absolute text-sm mt-3 block">
                  {createRequest.errorMessage}
                </span>
              )}
            </div>
            <p className="text-white">
              Mit Abschicken des Formulars wird ein neuer Nutzer angelegt. Der
              Nutzer erhält eine E-Mail mit einem Link, über den er sein
              Passwort setzen kann. Der Nutzer erhält Zugriff auf die Netzwerke,
              die hier eingegeben werden.
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
  )) as Session;

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

export default Administration;
