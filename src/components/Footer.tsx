const Footer = () => {
  return (
    <footer className="bg-white md:text-md text-sm px-5 md:px-10 pb-14">
      <div>
        <img src={"/assets/bmi-logo.svg"} alt="Logo BMI" />
      </div>
      <div className="lg:flex justify-between">
        <div className="md:mb-0 flex flex-wrap flex-row mb-5">
          <span className="mr-4">Impressum</span>
          <span className="mr-4">Datenschutz</span>
          <span>
            <a
              href="https://www.onlinezugangsgesetz.de/"
              rel="noopener noreferrer"
              target={"_blank"}
            >
              Onlinezugangsgesetz.de
            </a>
          </span>
        </div>
        <span>© Bundesministerium des Innern und für Heimat, 2022</span>
      </div>
    </footer>
  );
};

export default Footer;
