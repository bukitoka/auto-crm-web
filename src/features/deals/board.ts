import type { Deal, PipelineStage } from "./types";

/** One lane on the deals canvas. */
export type StageColumn = {
  stage: PipelineStage;
  deals: Deal[];
  total: number;
};

/** Group deals into one column per stage (in stage order), with the summed value. */
export function groupDealsByStage(deals: Deal[], stages: PipelineStage[]): StageColumn[] {
  return [...stages]
    .sort((a, b) => a.position - b.position)
    .map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage_id === stage.id);
      const total = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);
      return { stage, deals: stageDeals, total };
    });
}

/** Return a copy of `deals` with one deal moved to `stage` (used for optimistic updates). */
export function moveDeal(deals: Deal[], dealId: string, stage: PipelineStage): Deal[] {
  return deals.map((deal) =>
    deal.id === dealId
      ? {
          ...deal,
          stage_id: stage.id,
          stage: { id: stage.id, name: stage.name, is_won: stage.is_won, is_lost: stage.is_lost },
        }
      : deal,
  );
}

const OPEN_STAGE_DOTS = ["bg-teal-300", "bg-teal-500", "bg-teal-700", "bg-teal-900"];

/**
 * Color of the small dot next to each stage name, keyed by stage id:
 * a teal ramp for open stages (in order), success for won, destructive for lost.
 */
export function stageDotClasses(stages: PipelineStage[]): Record<string, string> {
  const classes: Record<string, string> = {};
  let openIndex = 0;
  for (const stage of [...stages].sort((a, b) => a.position - b.position)) {
    if (stage.is_won) {
      classes[stage.id] = "bg-success";
    } else if (stage.is_lost) {
      classes[stage.id] = "bg-destructive";
    } else {
      classes[stage.id] = OPEN_STAGE_DOTS[openIndex % OPEN_STAGE_DOTS.length];
      openIndex += 1;
    }
  }
  return classes;
}
