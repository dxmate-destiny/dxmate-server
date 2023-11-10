const { rd } = require("./firebase-productions-manager");

async function checkDxmatePlayerRegistered (discordId) {
    // Get DXmate player data reference.
    const dxmatePlayerDataRef = rd.ref(`players/${discordId}`);

    // Get DXmate player data snapshot.
    const dxmatePlayerDataSnapshot = await dxmatePlayerDataRef.once('value');

    return dxmatePlayerDataSnapshot.exists();
}

module.exports = { checkDxmatePlayerRegistered };