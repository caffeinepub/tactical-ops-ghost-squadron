import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

actor {
  type Stats = {
    attack : Nat;
    defense : Nat;
    speed : Nat;
  };

  type Profile = {
    username : Text;
    level : Nat;
    xp : Nat;
    stats : Stats;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      switch (Text.compare(profile1.username, profile2.username)) {
        case (#equal) { Nat.compare(profile1.level, profile2.level) };
        case (order) { order };
      };
    };
  };

  type SquadMember = {
    profile : Profile;
    role : Text;
  };

  type Mission = {
    title : Text;
    location : Text;
    objectives : Text;
    difficulty : Nat;
    status : MissionStatus;
    xpReward : Nat;
  };

  module Mission {
    public func compare(mission1 : Mission, mission2 : Mission) : Order.Order {
      switch (Nat.compare(mission1.difficulty, mission2.difficulty)) {
        case (#equal) { Text.compare(mission1.title, mission2.title) };
        case (order) { order };
      };
    };
  };

  type MissionStatus = {
    #locked;
    #available;
    #completed;
  };

  type MissionOutcome = {
    #success;
    #fail;
  };

  type GameData = {
    missions : Map.Map<Nat, Mission>;
    squad : Map.Map<Text, SquadMember>;
    globalLocations : Set.Set<Text>;
    nextMissionId : Nat;
  };

  let profiles = Map.empty<Principal, Profile>();
  let games = Map.empty<Principal, GameData>();

  public shared ({ caller }) func register(username : Text) : async () {
    if (profiles.containsKey(caller)) { Runtime.trap("Username already exists") };
    let profile : Profile = {
      username;
      level = 1;
      xp = 0;
      stats = {
        attack = 10;
        defense = 10;
        speed = 10;
      };
    };
    profiles.add(caller, profile);
    let gameData : GameData = {
      missions = Map.empty<Nat, Mission>();
      squad = Map.empty<Text, SquadMember>();
      globalLocations = Set.empty<Text>();
      nextMissionId = 0;
    };
    games.add(caller, gameData);
  };

  public query ({ caller }) func getProfile() : async Profile {
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getMissions() : async [Mission] {
    switch (games.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?game) { game.missions.values().toArray().sort() };
    };
  };

  public query ({ caller }) func hasCompletedMission(missionId : Nat) : async Bool {
    switch (games.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?game) {
        switch (game.missions.get(missionId)) {
          case (null) { false };
          case (?mission) { mission.status == #completed };
        };
      };
    };
  };

  public shared ({ caller }) func completeMission(missionId : Nat, outcome : MissionOutcome) : async () {
    let game = switch (games.get(caller)) {
      case (null) { Runtime.trap("User has not created a profile yet.") };
      case (?game) { game };
    };
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User has not created a profile yet.") };
      case (?profile) { profile };
    };
    switch (outcome) {
      case (#success) {
        let mission = switch (game.missions.get(missionId)) {
          case (null) { Runtime.trap("Mission does not exist") };
          case (?mission) { mission };
        };
        if (mission.status == #completed) { Runtime.trap("Mission already completed") };

        let newMission = { mission with status = #completed };
        game.missions.add(missionId, newMission);

        let newXP = profile.xp + mission.xpReward;
        checkLevelUp(caller, newXP);
      };
      case (#fail) { Runtime.trap("Mission failed, no reward") };
    };
  };

  func checkLevelUp(caller : Principal, xp : Nat) {
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User has not created a profile yet.") };
      case (?profile) { profile };
    };
    if (xp >= 100) {
      let newProfile = {
        profile with
        xp = 0;
        level = profile.level + 1;
        stats = {
          profile.stats with
          attack = profile.stats.attack + 5;
          defense = profile.stats.defense + 5;
          speed = profile.stats.speed + 5;
        };
      };
      profiles.add(caller, newProfile);
    } else {
      let newProfile = { profile with xp };
      profiles.add(caller, newProfile);
    };
  };

  public shared ({ caller }) func addSquadMember(name : Text, role : Text) : async () {
    let game = switch (games.get(caller)) {
      case (null) { Runtime.trap("User has not created a profile yet.") };
      case (?game) { game };
    };

    if (game.squad.containsKey(name)) { Runtime.trap("Squad member already exists") };
    let squadMember : SquadMember = {
      profile = {
        username = name;
        level = 1;
        xp = 0;
        stats = {
          attack = 10;
          defense = 10;
          speed = 10;
        };
      };
      role;
    };
    game.squad.add(name, squadMember);
  };

  public query ({ caller }) func getSquad() : async [SquadMember] {
    switch (games.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?game) { game.squad.values().toArray() };
    };
  };

  public query ({ caller }) func getGlobalLocations() : async [Text] {
    switch (games.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?game) { game.globalLocations.toArray() };
    };
  };
};
