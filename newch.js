const axios = require("axios");
require("dotenv").config();

const token = process.env.token;

// Example: Each entry needs its own grow time (ms)
const plantSeed = [
  {
    userGardensID: "68c44690637b77c0d1b5b4a2",
    userBedsID: "68c44690637b77c0d1b5b49e",
    seedID: "673e0c942c7bfd708b35244d",
    growTime: 120000 // 2 minutes (example: cabbage = 13min, pepper = ??)
  },
  {
    userGardensID: "68c44690637b77c0d1b5b4a2",
    userBedsID: "68c44661637b77c0d1b5ac3f",
    seedID: "673e0c942c7bfd708b352465",
    growTime: 240000
  },
  {
    userGardensID: "68c44690637b77c0d1b5b4a2",
    userBedsID: "68c44817f41e7e7f5b18f754",
    seedID: "67dc227a59b878f195998e7e",
    growTime: 480000
},
{
    userGardensID: "68c44690637b77c0d1b5b4a2",
    userBedsID: "68c82e658b03050f6d43d7fc",
    seedID: "673e0c942c7bfd708b352423",
    growTime: 1020000
}
  // add more seeds with their times here
];

// 🔹 Plant one seed and return its farming ID
async function plantSeedOnce(seed) {
  try {
    const res = await axios.post(
      "https://chainers.io/api/farm/control/plant-seed",
      {
        userGardensID: seed.userGardensID,
        userBedsID: seed.userBedsID,
        seedID: seed.seedID,
      },
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    const userFarmingID = res.data?.data?.userFarmingID;
    if (userFarmingID) {
      console.log(`🌱 Planted ${seed.seedID} at ${new Date().toLocaleTimeString()}`);
      return userFarmingID;
    } else {
      console.error("⚠ No userFarmingID returned for seed", seed.seedID);
      return null;
    }
  } catch (err) {
    console.error(`❌ Plant error (${seed.seedID}):`, err.message);
    return null;
  }
}

// 🔹 Harvest one seed
async function harvestSeed(userFarmingID) {
  try {
    const res = await axios.post(
      "https://chainers.io/api/farm/control/collect-harvest",
      { userFarmingID },
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    console.log(`🌾 Harvested ${userFarmingID} at ${new Date().toLocaleTimeString()}`);
    return true;
  } catch (err) {
    console.error(`❌ Harvest error (${userFarmingID}):`, err.message);
    return false;
  }
}

// 🔹 Full cycle for one seed
async function runSeedCycle(seed) {
  while (true) {
    const farmingID = await plantSeedOnce(seed);
    if (!farmingID) {
      await new Promise(r => setTimeout(r, 10000)); // wait & retry if fail
      continue;
    }

    // wait growTime before harvesting
    await new Promise(r => setTimeout(r, seed.growTime));

    const success = await harvestSeed(farmingID);
    if (!success) {
      await new Promise(r => setTimeout(r, 10000));
    }

    // small gap before replanting
    await new Promise(r => setTimeout(r, 5000));
  }
}

// 🔹 Start all seeds in parallel
async function startAll() {
  console.log("▶ Starting farm automation...");
  for (let seed of plantSeed) {
    runSeedCycle(seed); // independent loop per seed
  }
}

startAll();
