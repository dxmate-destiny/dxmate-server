const { rd } = require("./firebase-productions-manager");

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

module.exports = { checkDxmatePlayerRegistered, registerDxmatePlayer, getDxmatePlayerData, saveSinglesUpdatedSkill, saveDoublesUpdatedSkill };