import type { GetServerSideProps, NextPage } from "next";
import { staticSecrets } from "../utils/staticSecrets";
import Page from "../components/Page";
import InfoContent from "../components/InfoContent";
import Meta from "../components/Meta";

interface Props {
  displayNotAvailable: boolean;
  code: string;
  keycloakIssuer: string;
}
const OZGSecurityChallenge2023: NextPage<Props> = ({ keycloakIssuer }) => {
  return (
    <Page>
      <Meta
        title="Die OZG-Security-Challenge 2023: Gemeinsam zu mehr IT-Sicherheit
    "
      />
      <div className="flex-1">
        <InfoContent />
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  // check if the user does provide a valid query parameter
  const code = query["s"];
  if (code && staticSecrets[code as string]) {
    return {
      props: {
        displayNotAvailable: false,
        code: code,
      },
    };
  }
  return {
    props: {
      keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
      displayNotAvailable: true,
      code: !!code ? code : null,
    },
  };
};

export default OZGSecurityChallenge2023;
