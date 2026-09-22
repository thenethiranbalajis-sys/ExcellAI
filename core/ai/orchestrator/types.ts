import type { ChatMessage, ChatResponse } from "../types";

export interface OrchestrationRequest {
  providerId: string;
  model: string;
  messages: ChatMessage[];
}

export type PlanStepKind = "model";

export interface PlanStep {
  id: string;
  kind: PlanStepKind;
  providerId: string;
  model: string;
  reason: string;
}

export interface ExecutionPlan {
  id: string;
  steps: PlanStep[];
}

export interface OrchestrationResult {
  plan: ExecutionPlan;
  response: ChatResponse;
}
