"use client";

import { FunctionComponent, useState } from "react";
import { withAuthProvider } from "../../providers/AuthProvider";
import Image from "next/image";

const BPAHeader: FunctionComponent = () => {
  return (
    <header className="z-50 sticky top-0 bg-zinc-950">
      <div className="container">
        <div className="flex flex-row flex-wrap justify-between items-center">
          <div className="my-8">
            <Image
              priority
              alt="Logo Adler"
              width={250}
              height={100}
              src={"/assets/logo.svg"}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default withAuthProvider(BPAHeader);
