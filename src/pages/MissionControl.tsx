import { useSearchParams } from "react-router-dom";

import MissionShell, { type Workspace, WORKSPACES } from "@/components/mission-control/MissionShell";
import OverviewWorkspace from "@/components/mission-control/OverviewWorkspace";
import WorkspaceStub from "@/components/mission-control/WorkspaceStub";

const VALID = new Set<Workspace>(WORKSPACES.map((w) => w.key));

const MissionControl = () => {
  const [search] = useSearchParams();
  const raw = (search.get("workspace") ?? "overview") as Workspace;
  const active: Workspace = VALID.has(raw) ? raw : "overview";

  return (
    <MissionShell active={active}>
      {active === "overview" ? <OverviewWorkspace /> : <WorkspaceStub workspace={active} />}
    </MissionShell>
  );
};

export default MissionControl;
