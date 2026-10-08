import {
  ASSIGNABLE_BOOKING_STATUSES,
  canReceiveCleanerAssignment,
} from "@/app/lib/staff-pure";

export const DISPATCH_ASSIGNABLE_STATUSES = ASSIGNABLE_BOOKING_STATUSES;

export function canManageDispatchAssignment(status: string): boolean {
  return canReceiveCleanerAssignment(status);
}

export function resolveSelectedCleanerId(
  candidates: Array<{ id: string }>,
  currentStaffId: string | null | undefined,
): string {
  return currentStaffId && candidates.some((candidate) => candidate.id === currentStaffId)
    ? currentStaffId
    : "";
}

export function buildDispatchAssignmentRequest(input: {
  staffId: string;
  expectedAssignmentId: string | null;
}): { staffId: string; expectedAssignmentId: string | null } {
  return {
    staffId: input.staffId,
    expectedAssignmentId: input.expectedAssignmentId,
  };
}

export function classifyAssignmentMutationResponse(input: {
  ok: boolean;
  status: number;
}): "success" | "conflict" | "error" {
  if (input.ok) return "success";
  return input.status === 409 ? "conflict" : "error";
}

export function shouldRefreshDispatchAfterAssignment(input: {
  ok: boolean;
  status: number;
}): boolean {
  const outcome = classifyAssignmentMutationResponse(input);
  return outcome === "success" || outcome === "conflict";
}
