import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    speed: bigint;
    defense: bigint;
    attack: bigint;
}
export interface SquadMember {
    role: string;
    profile: Profile;
}
export interface Profile {
    xp: bigint;
    username: string;
    level: bigint;
    stats: Stats;
}
export interface Mission {
    status: MissionStatus;
    title: string;
    xpReward: bigint;
    difficulty: bigint;
    objectives: string;
    location: string;
}
export enum MissionOutcome {
    fail = "fail",
    success = "success"
}
export enum MissionStatus {
    completed = "completed",
    locked = "locked",
    available = "available"
}
export interface backendInterface {
    addSquadMember(name: string, role: string): Promise<void>;
    completeMission(missionId: bigint, outcome: MissionOutcome): Promise<void>;
    getGlobalLocations(): Promise<Array<string>>;
    getMissions(): Promise<Array<Mission>>;
    getProfile(): Promise<Profile>;
    getSquad(): Promise<Array<SquadMember>>;
    hasCompletedMission(missionId: bigint): Promise<boolean>;
    register(username: string): Promise<void>;
}
