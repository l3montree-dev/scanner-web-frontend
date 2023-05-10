import { faCaretDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection, ShareLink } from "@prisma/client";
import { FunctionComponent } from "react";
import DashboardPage from "../../components/DashboardPage";

import PageTitle from "../../components/PageTitle";
import ResultEnvelope from "../../components/ResultEnvelope";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import Button from "../../components/common/Button";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { useQuicktest } from "../../hooks/useQuicktest";
import { collectionService } from "../../services/collectionService";
import { shareLinkService } from "../../services/shareLinkService";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import FormInput from "../../components/FormInput";

interface Props {
  keycloakIssuer: string;
  collections: Array<DTO<Collection & { shareLinks: Array<DTO<ShareLink>> }>>;
}
const QuicktestPage: FunctionComponent<Props> = (props) => {
  const {
    website,
    setWebsite,
    scanRequest,
    refreshRequest,
    target,
    dateString,
    amountPassed,
    handleRefresh,
    onSubmit,
  } = useQuicktest();
  return (
    <DashboardPage
      title="Webseiten-Schnelltest"
      keycloakIssuer={props.keycloakIssuer}
    >
      <SideNavigation />
      <>
        <div className="flex-1">
          <div className="lg:flex lg:flex-row w-full flex-wrap  items-start justfy-between mb-12 lg:mb-0">
            <div className="flex-1">
              <div className="text-black mb-10 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-2xl text-black mb-0 font-bold"
                  stringRep="Schnelltest"
                >
                  Schnelltest
                </PageTitle>
              </div>
            </div>
          </div>
          <div className="">
            <form
              onSubmit={onSubmit}
              className="flex items-end flex-wrap gap-2 justify-end"
            >
              <div className="flex-1">
                <FormInput
                  label="Domain*"
                  onChange={(e) => setWebsite(e)}
                  value={website}
                  placeholder="example.com"
                />
              </div>

              <Button
                loading={scanRequest.isLoading}
                RightIcon={<FontAwesomeIcon icon={faAngleRight} />}
                type="submit"
              >
                Scan starten
              </Button>
            </form>
            {scanRequest.errored && (
              <small className="text-rot-100 mt-3 -mb-5 flex">
                {scanRequest.errorMessage}
              </small>
            )}
          </div>
          {target !== null && (
            <div className="pt-5 p-0 mt-2">
              <ResultEnvelope
                target={target}
                dateString={dateString}
                handleRefresh={handleRefresh}
                refreshRequest={refreshRequest}
                amountPassed={amountPassed}
              />
            </div>
          )}
        </div>
      </>
    </DashboardPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    const [collections, links] = await Promise.all([
      collectionService.getAllCollectionsOfUser(currentUser, prisma),
      shareLinkService.getShareLinksOfUser(currentUser, prisma),
    ]);

    return {
      props: {
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        collections: toDTO(
          collections
            .filter((c) => c.id !== currentUser.defaultCollectionId)
            .map((c) => ({
              ...c,
              shareLinks: toDTO(links.filter((l) => l.collectionId === c.id)),
            }))
        ),
      },
    };
  },
  withCurrentUserServerSideProps,
  withDB
);
export default QuicktestPage;
