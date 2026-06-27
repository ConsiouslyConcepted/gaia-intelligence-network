import { HudPanel } from "./MissionShell";
import { ReportsPanel } from "@/components/harmonics/ReportsPanel";

const ReportsWorkspace = () => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="h-full grid grid-rows-[auto_1fr] gap-3 min-h-full">
        <HudPanel className="p-4">
          <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
            Workspace · Intelligence Archive
          </div>
          <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
            Intelligence Reports
          </h2>
          <p className="text-[10px] text-muted-foreground/75 mt-1 max-w-[680px]">
            Generate Daily, Weekly, Monthly, or Custom reports synthesized across the loaded layers. Reports are archived in this browser and can be revisited any time.
          </p>
        </HudPanel>

        <HudPanel className="p-4">
          <ReportsPanel context={{ surface: "mission-control/reports" }} />
        </HudPanel>
      </div>
    </div>
  );
};

export default ReportsWorkspace;
