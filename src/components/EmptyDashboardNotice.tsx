import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "./common/Button";
import React from "react";
import { useState } from "react";
import ReactPlayer from "react-player";
import Modal from "../components/Modal";
import AddDomainForm from "../components/AddDomainForm";
import { clientHttpClient } from "../services/clientHttpClient";

const EmptyDashboardNotice = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddRecord = async (target: string) => {
    const res = await clientHttpClient(`/api/targets`, crypto.randomUUID(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target }),
    });

    if (!res.ok) {
      throw res;
    }
    const detailedDomain = await res.json();
  };

  const handleFileFormSubmit = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await clientHttpClient("/api/targets", crypto.randomUUID(), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw res;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-8 items-center">
        <div className="text-left max-w-lg">
          <h2 className="max-w-2xl text-xl font-bold tracking-tight text-white">
            Es sind noch keine Domains für Ihr Dashboard hinterlegt
          </h2>
          <p className="mt-6 text-sm text-white/75">
            Herzlich willkommen auf Ihrem Dashboard. Hier sehen Sie täglich
            erstellte Statistiken zu Ihren Domains. Ihnen werden standardmäßig
            die Ergebnisse der Top 100.000 .de sowie globalen Domains als
            Referenz angezeigt.
          </p>
          <p className="mt-6 text-sm text-white/75">
            Wir empfehlen Ihnen, sich mithilfe des Einführungsvideos mit dem
            System vertraut zu machen. Bei Fragen wenden Sie sich gerne an
            unseren E-Mail-Support oder besuchen Sie unsere Sprechstunde.
          </p>
          <ul
            role="list"
            className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-white"
          >
            <li key="sprechstunde" className="flex gap-x-3">
              <FontAwesomeIcon
                className="h-7 w-7 flex-none mt-2"
                icon={faPhone}
              />
              <span>
                <a href="tel:020878012422" className="text-lightning-700">
                  0208 78012422
                </a>
                <br />
                (Mi. 10:00 - 12:00 Uhr)
              </span>
            </li>
            <li key="one-pager" className="flex gap-x-3">
              <FontAwesomeIcon
                className="h-7 w-7 flex-none mt-2"
                icon={faEnvelope}
              />
              <span>
                <a
                  href="mailto:ozgsec@bmi.bund.de"
                  className="text-lightning-700"
                >
                  ozgsec@bmi.bund.de
                </a>
                <br />
                E-Mail Support
              </span>
            </li>
          </ul>
          <div className="mt-10 flex items-center justify-left gap-x-6">
            <Button
              type="button"
              loading={false}
              onClick={() => setIsOpen(true)}
            >
              Domains hinzufügen
            </Button>
            <a href="/dashboard/targets" className="">
              Zur Domainübersicht <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="player-wrapper rounded-lg">
          <ReactPlayer
            className="react-player"
            url={
              "https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4"
            }
            width="100%"
            height="100%"
            controls
          />
        </div>
      </div>
      <Modal
        title="Domains hinzufügen"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <AddDomainForm
          onNewDomain={handleAddRecord}
          onFileFormSubmit={handleFileFormSubmit}
        />
      </Modal>
    </>
  );
};

export default EmptyDashboardNotice;
