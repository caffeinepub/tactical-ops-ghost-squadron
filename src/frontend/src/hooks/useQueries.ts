import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Mission, MissionOutcome, Profile, SquadMember } from "../backend";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const profile = await actor.getProfile();
        return profile.username ? profile : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMissions() {
  const { actor, isFetching } = useActor();
  return useQuery<Mission[]>({
    queryKey: ["missions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSquad() {
  const { actor, isFetching } = useActor();
  return useQuery<SquadMember[]>({
    queryKey: ["squad"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSquad();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGlobalLocations() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["globalLocations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGlobalLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      squadMembers,
    }: {
      username: string;
      squadMembers: { name: string; role: string }[];
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.register(username);
      await Promise.all(
        squadMembers.map((m) => actor.addSquadMember(m.name, m.role)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["squad"] });
    },
  });
}

export function useCompleteMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      missionId,
      outcome,
    }: { missionId: bigint; outcome: MissionOutcome }) => {
      if (!actor) throw new Error("No actor");
      await actor.completeMission(missionId, outcome);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
