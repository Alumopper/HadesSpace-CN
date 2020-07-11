// generated by generateGameData.js
// at Sat Jul 11 2020

let data = {
  N_ColonizeFirstPlanet: {
    Name: "N_ColonizeFirstPlanet",
    TID: "TID_TUT_COLONIZE_FIRST_PLANET",
    TID_Description: "TID_TUT_COLONIZE_FIRST_PLANET_DESCR",
    IntParam: 1,
    FuelReward: 50,
    maxLevel: 1,
    MissionType: "ColonizePlanet",
    MaxShipsAtStep: "1!0!0",
    ConsumeFuelAfterThisStep: 1,
    XPReward: 50,
    BCReward: 100,
    ClientTutorialHelper: "FirstColonize",
    HintTID: "TID_TUT_FIRST_SHIP_INTRO_LABEL",
    DisableMovement: 1,
  },
  N_UpgradePlanetToLv2: {
    Name: "N_UpgradePlanetToLv2",
    TID: "TID_TUT_UPGRADE_PLANET",
    TID_Description: "TID_TUT_UPGRADE_PLANET_DESCR",
    IntParam: 1,
    FuelReward: 50,
    maxLevel: 1,
    MissionType: "UpgradePlanet",
    EnterNameAfterStepIsComplete: 1,
    MaxShipsAtStep: "1!0!0",
    XPReward: 20,
    BCReward: 1000,
    ClientTutorialHelper: "BuildTradeOutpost",
  },
  N_ConstructShipyard: {
    Name: "N_ConstructShipyard",
    TID: "TID_TUT_CONSTRUCT_SHIPYARD",
    TID_Description: "TID_TUT_CONSTRUCT_SHIPYARD_INFO",
    maxLevel: 1,
    MissionType: "ConstructBuilding",
    MaxShipsAtStep: "1!0!0",
    NameParam: "Shipyard",
    BCReward: 1000,
    ClientTutorialHelper: "ConstructBuilding",
    HintTID: "TID_TUT_SHIPYARD_HINT",
  },
  N_ConstructTransport: {
    Name: "N_ConstructTransport",
    TID: "TID_TUT_CREATE_SECOND_TRANSPORT",
    TID_Description: "TID_TUT_CREATE_SECOND_TRANSPORT_INFO",
    IntParam: 2,
    maxLevel: 1,
    MissionType: "ConstructFleet",
    MaxShipsAtStep: "2!0!0",
    NameParam: "Transport",
    XPReward: 20,
    BCReward: 500,
    ClientTutorialHelper: "ConstructFleet",
  },
  N_ColonizeSecondPlanet: {
    Name: "N_ColonizeSecondPlanet",
    TID: "TID_TUT_COLONIZE_SECOND_PLANET",
    TID_Description: "TID_TUT_COLONIZE_SECOND_PLANET_DESCR",
    IntParam: 2,
    maxLevel: 1,
    MissionType: "ColonizePlanet",
    MaxShipsAtStep: "2!0!0",
    XPReward: 30,
    BCReward: 1000,
    ClientTutorialHelper: "SecondColonize",
    HintTID: "TID_TUT_HINT_MOVEMENT",
  },
  N_CollectMoneyForMiner: {
    Name: "N_CollectMoneyForMiner",
    TID: "TID_TUT_KEEP_DOING_STUFF",
    TID_Description: "TID_TUT_KEEP_DOING_STUFF_DESCR",
    IntParam: 500,
    maxLevel: 1,
    MissionType: "WaitForResources",
    MaxShipsAtStep: "2!0!0",
  },
  N_ConstructMiner: {
    Name: "N_ConstructMiner",
    TID: "TID_TUT_CONSTRUCT_SHIP",
    TID_Description: "TID_TUT_MINER_INFO",
    IntParam: 1,
    maxLevel: 1,
    MissionType: "ConstructFleet",
    MaxShipsAtStep: "2!1!0",
    NameParam: "Miner",
    XPReward: 50,
    ClientTutorialHelper: "ConstructFleet",
  },
  N_StartMiningCycle: {
    Name: "N_StartMiningCycle",
    TID: "TID_TUT_MINING_TITLE",
    TID_Description: "TID_TUT_MINING_DESCR",
    FuelReward: 50,
    maxLevel: 1,
    MissionType: "DoMining",
    MaxShipsAtStep: "2!1!0",
    AskForNotificationsAfterStepIsComplete: 1,
    ShowModulesButtonAfterThisStep: 1,
    XPReward: 50,
    BCReward: 800,
    ClientTutorialHelper: "DoMining",
    HintTID: "TID_TUT_HINT_MINING",
  },
  N_ViewObjectives: {
    Name: "N_ViewObjectives",
    TID: "TID_TUT_VIEW_OBJECTIVES",
    TID_Description: "TID_TUT_VIEW_OBJECTIVES_DESCR",
    maxLevel: 1,
    MissionType: "ViewObjectives",
    MaxShipsAtStep: "2!1!0",
    ClientTutorialHelper: "ViewObjectives",
    DontHideTopHUD: 1,
  },
};

let byTypes = {
  default: ["N_ColonizeFirstPlanet", "N_UpgradePlanetToLv2", "N_ConstructShipyard", "N_ConstructTransport", "N_ColonizeSecondPlanet", "N_CollectMoneyForMiner", "N_ConstructMiner", "N_StartMiningCycle", "N_ViewObjectives"],
};

module.exports = { data, byTypes };
