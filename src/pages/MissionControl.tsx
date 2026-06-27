import { useSearchParams } from "react-router-dom";

import MissionShell, { type Workspace, WORKSPACES } from "@/components/mission-control/MissionShell";
import OverviewWorkspace from "@/components/mission-control/OverviewWorkspace";
import CosmicAddressWorkspace from "@/components/mission-control/CosmicAddressWorkspace";
import WorkspaceStub from "@/components/mission-control/WorkspaceStub";

const VALID = new Set<Workspace>(WORKSPACES.map((w) => w.key));

const MissionControl = () => {
  const [search] = useSearchParams();
  const raw = (search.get("workspace") ?? "overview") as Workspace;
  const active: Workspace = VALID.has(raw) ? raw : "overview";

  const renderWorkspace = () => {
    switch (active) {
      case "overview": return <OverviewWorkspace />;
      case "address":  return <CosmicAddressWorkspace />;
      default:         return <WorkspaceStub workspace={active} />;
    }
  };

  return <MissionShell active={active}>{renderWorkspace()}</MissionShell>;
};

export default MissionControl;
