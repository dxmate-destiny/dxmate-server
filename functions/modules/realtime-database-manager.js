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

module.exports = { checkDxmatePlayerRegistered, registerDxmatePlayer };