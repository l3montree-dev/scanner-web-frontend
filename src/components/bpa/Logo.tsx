import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (
        window.scrollY > 0 &&
        // only animate if it wont end up in an infinite loop
        document.documentElement.scrollHeight - window.innerHeight > 95 - 36
      ) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <Link href="/">
      <div
        style={{
          height: scrolled ? 36 : 95,
          width: 341.5,
          marginTop: 37,
          marginBottom: 37,
        }}
        className="flex relative flex-row transition-bund items-start"
      >
        <Image
          alt="Logo Adler"
          width={37}
          height={50}
          src={"/assets/logo_eagle.svg"}
        />
        <div className="transition-bund ml-2 relative">
          <Image
            className="transition-bund origin-top"
            alt="Logo Flagge"
            width={5.5}
            height={100}
            style={{ transform: scrolled ? "scaleY(0.367)" : "" }}
            src={"/assets/logo_flag.svg"}
          />
        </div>
        <div style={{ width: 280 }} className="absolute right-0">
          <Image
            alt="Logo Text"
            className="transition-bund"
            style={{ opacity: scrolled ? 0 : 1 }}
            width={280}
            height={50}
            src={"/assets/logo_text.svg"}
          />
        </div>
      </div>
    </Link>
  );
};

export default Logo;
