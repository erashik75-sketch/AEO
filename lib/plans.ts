import type { Plan } from "@prisma/client";

export function modelsForPlan(plan: Plan): Array<"claude" | "openai" | "perplexity" | "gemini"> {
  if (plan === "FREE") return ["claude"];
  return ["claude", "openai", "perplexity", "gemini"];
}

export function maxAgentsForPlan(plan: Plan): number {
  if (plan === "FREE") return 3;
  return 9;
}

export function maxBrands(plan: Plan): number {
  switch (plan) {
    case "FREE":
      return 1;
    case "PRO":
      return 5;
    default:
      return 999;
  }
}

export function maxScansPerMonth(plan: Plan): number {
  switch (plan) {
    case "FREE":
      return 2;
    case "PRO":
      return 15;
    default:
      return 999;
  }
}

export function canScheduleRescans(plan: Plan): boolean {
  return plan === "PRO" || plan === "AGENCY";
}
