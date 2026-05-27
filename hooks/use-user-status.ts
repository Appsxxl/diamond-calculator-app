import { trpc } from "@/lib/trpc";

const TRIAL_DAYS = 7;

export function useUserStatus() {
  const { data, isLoading, refetch } = trpc.activation.getMyStatus.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const isTeam = data?.status === "team";
  const isPaid = data?.status === "paid" || isTeam;

  let daysLeft = TRIAL_DAYS;
  let isExpired = false;

  if (!isPaid && data?.trialStartedAt) {
    const trialStart = new Date(data.trialStartedAt);
    const daysUsed = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    daysLeft = Math.max(0, TRIAL_DAYS - daysUsed);
    isExpired = daysUsed >= TRIAL_DAYS;
  }

  return {
    status: data?.status ?? null,
    isTeam,
    isPaid,
    daysLeft,
    isExpired,
    isLoading,
    refetch,
  };
}
