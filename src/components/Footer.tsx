const Footer = () => {
  return (
    <footer className="bg-white px-16 pb-14">
      <div className="w-96">
        <img src={"/assets/bmi-logo.svg"} alt="Logo BMI" />
      </div>
      <div className="md:flex justify-between">
        <div className="md:ml-10 md:mb-0 mb-10">
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
