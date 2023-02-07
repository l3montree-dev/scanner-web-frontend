import React, { FunctionComponent } from "react";
import useCheckbox from "../hooks/useCheckbox";
import useInput from "../hooks/useInput";
import useRequest from "../hooks/useRequest";
import { clientHttpClient } from "../services/clientHttpClient";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Countdown from "./Countdown";
import FormInput from "./FormInput";
import PrimaryButton from "./PrimaryButton";

const emailRegex = new RegExp(
  /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/
);
const ReleasePlaceHolder: FunctionComponent = () => {
  const email = useInput();
  const check = useCheckbox();

  const submitRequest = useRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.value || !emailRegex.test(email.value)) {
      return;
    }

    if (!check.value) {
      return;
    }

    const data = {
      email: email.value,
      check: check.value,
    };

    submitRequest
      .run(
        clientHttpClient("/api/subscribe", crypto.randomUUID(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      )
      .catch();
  };
  return (
    <div className="flex md:py-10 flex-col w-full justify-center text-white">
      <div className="max-w-screen-lg w-full md:p-5 mx-auto">
        <div className="md:mt-0 mt-10 md:p-10 text-center pb-14 p-5">
          <h1 className="text-5xl sm:order-1 order-2 mb-3 font-bold">
            OZG Security Challenge 2023
          </h1>
          <p className="text-white mt-10">
            Der Countdown läuft - die OZG Security Challenge starte in:
          </p>
        </div>
        <Countdown />
        <div className="md:mt-0 mt-10 md:p-10 text-white text-center pb-14 p-5">
          <p className="text-white">
            Mit unserem hier entstehenden Schnelltest können Sie Ihre Webseite
            in Bezug auf sechs spezifische IT-Sicherheitskriterien testen.
            Machen Sie mit und tragen Sie zur weiteren Steigerung der Sicherheit
            der öffentlichen Verwaltung bei.
          </p>
        </div>
        <div className="border border-deepblue-50 p-4">
          <p>
            Melden Sie sich jetzt für die OZG Security Challenge an und erhalten
            Sie exklusive Infos:
          </p>
          <form onSubmit={handleSubmit} className="text-black mt-5">
            <div className="">
              <FormInput
                type="email"
                placeholder="Geben Sie hier Ihre E-Mail Adresse ein"
                {...email}
                label="E-Mail Adresse"
              />
              <div className="flex flex-row mt-4 justify-between">
                <div className="text-white flex-row flex mr-5">
                  <div>
                    <Checkbox {...check} />
                  </div>
                  <p
                    onClick={() => check.onChange()}
                    className="ml-2 cursor-pointer"
                  >
                    Mit dem Absenden des Formulars stimme ich der Verarbeitung
                    meiner E-Mail Adresse gemäß der&nbsp;
                    <a
                      rel="noreferrer"
                      target="_blank"
                      className="underline"
                      href="https://www.bmi.bund.de/DE/service/datenschutz/datenschutz_node.html"
                    >
                      Datenschutzerklärung
                    </a>
                    , sowie dem Erhalt des OZG Security Challenge Newsletters
                    zu.
                  </p>
                </div>
                <div className="whitespace-nowrap">
                  <PrimaryButton
                    disabled={!check.checked || !emailRegex.test(email.value)}
                    loading={false}
                    type="submit"
                  >
                    Anmelden
                  </PrimaryButton>
                </div>
              </div>
            </div>
            {submitRequest.isError && (
              <div className="text-red-500 text-right mt-2">
                Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch
                mal.
              </div>
            )}
            {submitRequest.isSuccess && (
              <div className="text-lightning-500 text-right mt-2">
                Vielen Dank für Ihre Anmeldung.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReleasePlaceHolder;
