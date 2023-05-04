import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useWindowSize from "../../hooks/useWindowSize";
import dynamic from "next/dynamic";

const Logo = () => {
  const [scrolled, setScrolled] = useState(false);

  const { width } = useWindowSize();
  const factor = width > 768 ? 1 : 0.8;
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

  if (width === 0) {
    return null;
  }
  return (
    <Link className="hover:border-none" href="/">
      <div
        style={{
          height: (scrolled ? 36 : 95) * factor,
          width: 341.5 * factor,
          marginTop: 37 * factor,
          marginBottom: 37 * factor,
          marginRight: 37 * factor,
        }}
        className="flex relative flex-row transition-bund items-start"
      >
        <Image
          alt="Logo Adler"
          width={37 * factor}
          height={50 * factor}
          src={"/assets/logo_eagle.svg"}
        />
        <div className="transition-bund ml-2 relative">
          <Image
            className="transition-bund origin-top"
            alt="Logo Flagge"
            width={5.5 * factor}
            height={100 * factor}
            style={{ transform: scrolled ? "scaleY(0.367)" : "" }}
            src={"/assets/logo_flag.svg"}
          />
        </div>
        <div style={{ width: 280 * factor }} className="absolute right-0">
          <Image
            alt="Logo Text"
            className="transition-bund"
            style={{ opacity: scrolled ? 0 : 1 }}
            width={280 * factor}
            height={50 * factor}
            src={"/assets/logo_text.svg"}
          />
        </div>
      </div>
    </Link>
  );
};

export default Logo;
