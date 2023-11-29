const { rd } = require("./firebase-productions-manager");
const { calcRankPoints } = require("./rank-manager");

async function checkDxmatePlayerRegistered (discordId) {
    // Get DXmate player data reference.
    const dxmatePlayerDataRef = rd.ref(`players/${discordId}`);

    // Get DXmate player data snapshot.
    const dxmatePlayerDataSnapshot = await dxmatePlayerDataRef.once('value');

    return dxmatePlayerDataSnapshot.exists();
}

async function registerDxmatePlayer (discordId, slippiConnectCode, region) {
    // Get DXmate player data reference.
    const dxmatePlayerDataRef = rd.ref(`players/${discordId}`);

    // Generate default DXmate player data.
    const defaultDxmatePlayerData = {
        slippiConnectCode,
        region,
        skill: {
            singles: { mu: 25, sigma: 8.333333333333334 },
            doubles: { mu: 25, sigma: 8.333333333333334 }
        },
        rankedModeMatchCount: {
            singles: 0,
            doubles: 0
        }
    };

    // Register a new DXmate player.
    await dxmatePlayerDataRef.set(defaultDxmatePlayerData);
}

async function getDxmatePlayerData (discordId) {
    // Get DXmate player data reference.
    const dxmatePlayerDataRef = rd.ref(`players/${discordId}`);

    // Get DXmate player data snapshot.
    const dxmatePlayerDataSnapshot = await dxmatePlayerDataRef.once('value');

    return dxmatePlayerDataSnapshot.val();
}

async function saveSinglesUpdatedSkill (discordId, skill) {
    // Get Singles Skill reference.
    const singlesSkillRef = rd.ref(`players/${discordId}/skill/singles`);

    // Update skill.
    await singlesSkillRef.update(skill);
}

async function saveDoublesUpdatedSkill (discordId, skill) {
    // Get Doubles Skill reference.
    const doublesSkillRef = rd.ref(`players/${discordId}/skill/doubles`);

    // Update skill.
    await doublesSkillRef.update(skill);
}

async function addRankedSinglesMatchCount (discordId) {
    // Get Ranked match count reference.
    const rankedMatchCountRef = rd.ref(`players/${discordId}/rankedModeMatchCount`);

    // Get current Ranked match count snapshot.
    const currentRankedMatchCountSnapshot = await rankedMatchCountRef.once('value');

    // Get current Ranked match count.
    const currentRankedMatchCount = currentRankedMatchCountSnapshot.val();

    // Add Ranked Singles match count.
    await rankedMatchCountRef.update({ singles: currentRankedMatchCount.singles + 1 });
}

async function addRankedDoublesMatchCount (discordId) {
    // Get Ranked match count reference.
    const rankedMatchCountRef = rd.ref(`players/${discordId}/rankedModeMatchCount`);

    // Get current Ranked match count snapshot.
    const currentRankedMatchCountSnapshot = await rankedMatchCountRef.once('value');

    // Get current Ranked match count.
    const currentRankedMatchCount = currentRankedMatchCountSnapshot.val();

    // Add Ranked Singles match count.
    await rankedMatchCountRef.update({ doubles: currentRankedMatchCount.doubles + 1 });
}

async function getSinglesTop50Players () {
    // Get players reference.
    const playersRef = rd.ref('players');

    // Get players snapshot.
    const playersSnapshot = await playersRef.once('value');

    const players = [];

    playersSnapshot.forEach((playerSnapshot) => {
        // Get player data.
        const playerData = playerSnapshot.val();

        // Get Singles skill.
        const singlesSkill = playerData.skill.singles;

        // Get Rank Point.
        const rankPoint = calcRankPoints(singlesSkill.mu, singlesSkill.sigma);

        // Push to players array.
        players.push({ discordId: playerSnapshot.key, rankPoint });
    });

    // Sort by Rank Point.
    players.sort((a, b) => b.rankPoint - a.rankPoint);
    const singlesTop50Players = players.slice(0, 50);

    return singlesTop50Players;
}

module.exports = {
    checkDxmatePlayerRegistered,
    registerDxmatePlayer,
    getDxmatePlayerData,
    saveSinglesUpdatedSkill,
    saveDoublesUpdatedSkill,
    addRankedSinglesMatchCount,
    addRankedDoublesMatchCount,
    getSinglesTop50Players
};