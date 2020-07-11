// generated by generateGameData.js
// at Sat Jul 11 2020

let data = {
  HomeSystem1: {
    Name: "HomeSystem1",
    TID: "TID_CERB_STATION_HOME1",
    TID_Description: "TID_CERB_STATION_HOME_DESCR",
    DPS: 100,
    Model: "CerberusStation",
    maxLevel: 1,
    SpawnFleetIntervalSeconds: 86400,
    ShipToSpawn: "CerberusGuardian",
    MaxHP: 20000,
    MaxShield: 20000,
    AttackRange: 1000,
    ShieldRegenPerMinute: 10,
    ShieldRegenTimeAfterDamage: 3600,
    MaxShips: 3,
    AwardXP: 1000,
  },
  HomeSystem2: {
    Name: "HomeSystem2",
    TID: "TID_CERB_STATION_HOME2",
    TID_Description: "TID_CERB_STATION_HOME_DESCR",
    DPS: 140,
    Model: "CerberusStation_lv2",
    maxLevel: 1,
    SpawnFleetIntervalSeconds: 86400,
    ShipToSpawn: "CerberusGuardian",
    MaxHP: 50000,
    MaxShield: 50000,
    AttackRange: 1600,
    ShieldRegenPerMinute: 14,
    ShieldRegenTimeAfterDamage: 3600,
    MaxShips: 5,
    AwardXP: 3000,
  },
  HomeSystem3: {
    Name: "HomeSystem3",
    TID: "TID_CERB_STATION_HOME3",
    TID_Description: "TID_CERB_STATION_HOME_DESCR",
    DPS: 200,
    Model: "CerberusStation_lv3",
    maxLevel: 1,
    SpawnFleetIntervalSeconds: 86400,
    ShipToSpawn: "CerberusGuardian",
    MaxHP: 90000,
    MaxShield: 90000,
    AttackRange: 2400,
    ShieldRegenPerMinute: 20,
    ShieldRegenTimeAfterDamage: 3600,
    MaxShips: 7,
    AwardXP: 5000,
  },
};

let byTypes = {
  default: ["HomeSystem1", "HomeSystem2", "HomeSystem3"],
};

module.exports = { data, byTypes };
